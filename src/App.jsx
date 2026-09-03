import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Search, 
  PlusCircle, 
  BookmarkCheck, 
  Shield, 
  FileSpreadsheet, 
  Users, 
  Menu, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  Bell, 
  UserCheck, 
  Library,
  GraduationCap,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { GameCard } from './components/GameCard';
import { TeacherLibrary } from './components/TeacherLibrary';
import { AdminPanel } from './components/AdminPanel';
import { HomeroomManager } from './components/HomeroomManager';
import { RoleSwitcher } from './components/RoleSwitcher';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { AdminCreateGameModal } from './components/AdminCreateGameModal';
import { ClassroomPlayModal } from './components/ClassroomPlayModal';
import { TextbookDownloadManager } from './components/TextbookDownloadManager';
import { LectureSlideManager } from './components/LectureSlideManager';
import { LoginModal } from './components/LoginModal';
import { UserManagementModal } from './components/UserManagementModal';
import { StorageService } from './services/storage';
import { IDBStorageService } from './services/idbStorage';

export function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    StorageService.init();
    return StorageService.getCurrentUser();
  });
  const [activeTab, setActiveTab] = useState('catalog');
  const [baseGames, setBaseGames] = useState(() => {
    StorageService.init();
    return StorageService.getBaseGames();
  });
  const [savedGames, setSavedGames] = useState(() => {
    StorageService.init();
    const user = StorageService.getCurrentUser();
    return StorageService.getTeacherSavedGames(user?.id);
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);

  // Modals
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isAdminCreateGameOpen, setIsAdminCreateGameOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [editingGameTemplate, setEditingGameTemplate] = useState(null);
  const [playingGame, setPlayingGame] = useState(null);

  // Initial Load
  useEffect(() => {
    StorageService.init();
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setBaseGames(StorageService.getBaseGames());
      
      // 1. Instant sync load from RAM / LocalStorage
      const localGames = StorageService.getTeacherSavedGames(user?.id);
      setSavedGames(localGames);
      
      // 2. Await full IndexedDB sync to guarantee zero data loss on F5 page refresh
      try {
        const syncedGames = await StorageService.syncWithIndexedDB(user?.id);
        if (Array.isArray(syncedGames) && syncedGames.length >= localGames.length) {
          setSavedGames(syncedGames);
        }
      } catch (e) {
        console.warn("loadAllData syncWithIndexedDB error:", e);
      }
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setCurrentUser(loggedInUser);
    setBaseGames(StorageService.getBaseGames());
    setSavedGames(StorageService.getTeacherSavedGames(loggedInUser?.id));
  };

  const handleLogout = () => {
    StorageService.logoutUser();
    setCurrentUser(null);
    setIsRoleSwitcherOpen(false);
  };

  const handleSaveToMyGames = (savedGameData) => {
    const activeUserId = currentUser?.id || StorageService.getCurrentUser()?.id || 'user_admin';
    const saved = StorageService.saveTeacherGame(activeUserId, savedGameData);
    const updatedGames = StorageService.getTeacherSavedGames(activeUserId);
    setSavedGames(updatedGames);
    setActiveTab('my-games');
    alert(`🎉 Đã lưu bài game "${saved?.title || savedGameData?.title || 'Cá Nhân'}" thành công vào Kho Game Của Tôi!`);
  };

  const handleSaveAndPlay = (savedGameData) => {
    const activeUserId = currentUser?.id || StorageService.getCurrentUser()?.id || 'user_admin';
    const saved = StorageService.saveTeacherGame(activeUserId, savedGameData);
    const updatedGames = StorageService.getTeacherSavedGames(activeUserId);
    setSavedGames(updatedGames);
    setPlayingGame(saved || savedGameData);
    const gameName = saved?.title || savedGameData?.title || 'Cá Nhân';
    alert(`✨ Đã tự động lưu bài game "${gameName}" vào "Kho Game Của Tôi" để Thầy/Cô có thể dùng lại bất cứ lúc nào!`);
  };

  const handleDeleteSavedGame = (gameId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa game này khỏi Kho Game Của Tôi không?')) {
      StorageService.deleteTeacherSavedGame(currentUser?.id, gameId);
      setSavedGames(StorageService.getTeacherSavedGames(currentUser?.id));
    }
  };

  const handleUpdateLessonTitle = (gameId, newLessonTitle) => {
    StorageService.updateTeacherGameLessonTitle(currentUser?.id, gameId, newLessonTitle);
    setSavedGames(StorageService.getTeacherSavedGames(currentUser?.id));
  };

  const handleAdminAddGame = (newGameData) => {
    StorageService.addBaseGame(newGameData);
    setBaseGames(StorageService.getBaseGames());
    setIsAdminCreateGameOpen(false);
  };

  const handleDeleteBaseGame = (gameId) => {
    if (window.confirm('CẢNH BÁO ADMIN: Bạn có chắc muốn xóa vĩnh viễn mẫu game này khỏi hệ thống chung không?')) {
      StorageService.deleteBaseGame(gameId);
      setBaseGames(StorageService.getBaseGames());
    }
  };

  const handleSelectUser = (user) => {
    const activeUser = { ...user, isLoggedIn: true };
    StorageService.setCurrentUser(activeUser);
    setCurrentUser(activeUser);
    setSavedGames(StorageService.getTeacherSavedGames(activeUser?.id));
    setIsRoleSwitcherOpen(false);
  };

  // Filter Categories by Game Themes & Formats
  const categories = [
    'Tất cả',
    'Đối kháng Đội nhóm',
    'Trắc nghiệm kịch tính',
    'Bất ngờ & May mắn',
    'Khám phá bức ảnh',
    'Tư duy từ ngữ',
    'Ghi nhớ & Ghép cặp',
    'Hành động & Phản xạ',
    'Tương tác & Quay số',
    'Thử thách phiêu lưu'
  ];

  const filteredBaseGames = baseGames.filter(game => {
    const matchesCategory = selectedCategory === 'Tất cả' || 
                            game.category === selectedCategory || 
                            game.subject === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (game.tags && game.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout-wrapper" style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-dark)' }}>
      
      {/* Sleek Vertical Glassmorphism Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onOpenAdminCreateGame={() => setIsAdminCreateGameOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onLogout={handleLogout}
        myGamesCount={savedGames.length}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area - Spans 100% of remaining screen width */}
      <main className="app-main-content">
        
        {/* Mobile Top Navigation Bar (Visible on Phones & Tablets) */}
        <div className="mobile-header-bar">
          <div 
            onClick={() => setActiveTab('catalog')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.4)',
              flexShrink: 0
            }}>
              <GraduationCap size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
                Hệ Thống Trò Chơi
              </div>
              <div style={{ fontSize: '0.68rem', color: '#fde047', fontWeight: 800 }}>
                by Thầy Hảo Địa Lí
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setIsMobileAccountOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 12px',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)'
              }}
            >
              <User size={16} />
              <span>{currentUser ? (currentUser.name.split(' ').pop() || 'Tài Khoản') : 'Đăng Nhập'}</span>
            </button>

            <button 
              onClick={() => setIsMobileOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 12px',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 168, 150, 0.4)'
              }}
            >
              <Menu size={16} />
              <span>MENU</span>
            </button>
          </div>
        </div>
        
        {/* View 1: Kho Game Giáo Dục (Store Catalog) */}
        {activeTab === 'catalog' && (
          <div style={{ width: '100%' }}>
            
            {/* Search Bar & Category Filter Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                
                {/* Search Box */}
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                  <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', zIndex: 2 }} />
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="Tìm kiếm trò chơi giáo dục (ví dụ: Nghiêng đầu, Kéo co, Rồng lửa, Lật hình)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '48px', height: '48px', fontSize: '1rem', background: '#ffffff', color: '#0f172a', fontWeight: '800' }}
                  />
                </div>

              </div>

              {/* Category Pills Bar - Spreads Horizontally Across Page */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '8px' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 18px', fontSize: '0.88rem', borderRadius: '20px' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Cards Grid - Arranged Horizontally From Left to Right */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              width: '100%'
            }}>
              {filteredBaseGames.map(game => (
                <GameCard 
                  key={game.id}
                  game={game}
                  currentUser={currentUser}
                  onPlay={(template) => {
                    StorageService.incrementPlayCount(template.id, false);
                    setBaseGames(StorageService.getBaseGames());
                    setPlayingGame(template);
                  }}
                  onCustomize={(template) => setEditingGameTemplate(template)}
                  onDelete={handleDeleteBaseGame}
                />
              ))}
            </div>

            {filteredBaseGames.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Sparkles size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <h3>Không tìm thấy trò chơi nào phù hợp</h3>
                <p>Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục.</p>
              </div>
            )}

          </div>
        )}

        {/* View 2: Lớp Chủ Nhiệm (Homeroom Management System) */}
        {activeTab === 'homeroom' && (
          <HomeroomManager currentUser={currentUser} />
        )}

        {/* View 3: Kho Game Của Tôi (Teacher Saved Library) */}
        {activeTab === 'my-games' && (
          <TeacherLibrary 
            savedGames={savedGames}
            currentUser={currentUser}
            onPlayGame={(savedGame) => {
              StorageService.incrementPlayCount(savedGame.id, true);
              setSavedGames(StorageService.getTeacherSavedGames(currentUser?.id));
              setPlayingGame(savedGame);
            }}
            onEditGame={(savedGame) => setEditingGameTemplate(savedGame)}
            onDeleteGame={handleDeleteSavedGame}
            onBrowseCatalog={() => setActiveTab('catalog')}
            onUpdateLessonTitle={handleUpdateLessonTitle}
            onRefreshGames={(synced) => setSavedGames(synced)}
          />
        )}

        {/* View 4: Tải File SGK (Textbook Catalog Manager) */}
        {activeTab === 'textbook-download' && (
          <TextbookDownloadManager searchTerm={searchTerm} />
        )}

        {/* View 5: Slide Bài Giảng (Lecture Slide Manager) */}
        {activeTab === 'lecture-slides' && (
          <LectureSlideManager searchTerm={searchTerm} currentUser={currentUser} />
        )}

        {/* View 5: Quản Trị Admin */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel 
            baseGames={baseGames}
            onAddGame={handleAdminAddGame}
            onDeleteGame={handleDeleteBaseGame}
            onOpenUserManagement={() => setIsUserManagementOpen(true)}
          />
        )}

        {/* Footer */}
        <footer style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', borderTop: '1px solid rgba(0,168,150,0.15)', marginTop: '40px' }}>
          <p>© 2026 <strong>HỆ THỐNG HỖ TRỢ DẠY VÀ HỌC</strong> • Tác giả: <strong style={{ color: '#5eead4' }}>Thầy Hảo Địa Lý</strong> | 📱 Zalo hỗ trợ: <a href="https://zalo.me/0387806954" target="_blank" rel="noopener noreferrer" style={{ color: '#fde047', textDecoration: 'underline', fontWeight: 800 }}>0387806954</a></p>
        </footer>

      </main>

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

      <UserManagementModal 
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUser={currentUser}
      />

      {playingGame && (
        <ClassroomPlayModal 
          game={playingGame}
          onClose={() => setPlayingGame(null)}
        />
      )}

      {/* Mobile Bottom App Navigation Bar */}
      <div className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <Gamepad2 size={20} />
          <span>Kho Game</span>
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'my-games' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-games')}
        >
          <BookmarkCheck size={20} />
          <span>Game Của Tôi</span>
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'homeroom' ? 'active' : ''}`}
          onClick={() => setActiveTab('homeroom')}
        >
          <Users size={20} />
          <span>Lớp CN</span>
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'sgk' ? 'active' : ''}`}
          onClick={() => setActiveTab('sgk')}
        >
          <BookOpen size={20} />
          <span>Tải SGK</span>
        </button>

        <button 
          className={`mobile-nav-item ${isMobileAccountOpen ? 'active' : ''}`}
          onClick={() => setIsMobileAccountOpen(true)}
        >
          <User size={20} />
          <span>Tài Khoản</span>
        </button>
      </div>

      {/* Dedicated Mobile Account & Login Modal */}
      {isMobileAccountOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(20, 184, 166, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            color: '#ffffff',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setIsMobileAccountOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                color: '#ffffff',
                fontSize: '1.8rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)',
                border: '3px solid #00a896'
              }}>
                {currentUser?.name?.charAt(0) || '👤'}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {currentUser?.name || 'Giáo Viên'}
              </h3>
              <span className={currentUser?.role === 'admin' ? 'badge badge-admin' : 'badge badge-teacher'} style={{ fontSize: '0.75rem', marginTop: '6px', display: 'inline-block' }}>
                {currentUser?.role === 'admin' ? 'Quyền Admin' : 'Tài Khoản Giáo Viên'}
              </span>
            </div>

            {/* Account Information Details */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Tên đăng nhập:</span>
                <span style={{ fontWeight: 800, color: '#22d3ee' }}>{currentUser?.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Môn giảng dạy:</span>
                <span style={{ fontWeight: 800, color: '#ffffff' }}>{currentUser?.subject || 'Giáo dục'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Trường học:</span>
                <span style={{ fontWeight: 800, color: '#fde047' }}>{currentUser?.school || 'Hệ thống Sky-Line'}</span>
              </div>
            </div>

            {/* Author Profile Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <img 
                src="/assets/thayhaodiali.jpg" 
                alt="Thầy Hảo Địa Lí"
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #fbbf24', objectFit: 'cover' }} 
              />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800 }}>TÁC GIẢ WEBSITE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff' }}>Thầy Hảo Địa Lí</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsMobileAccountOpen(false);
                  handleLogout();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                }}
              >
                <LogOut size={18} /> Đăng Xuất Khỏi Hệ Thống
              </button>

              <button
                onClick={() => {
                  setIsMobileAccountOpen(false);
                  setIsMobileOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Menu size={18} /> Menu Quản Lý Hệ Thống
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
