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
  Clock,
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
import { VirtualLabManager } from './components/VirtualLabManager';
import { GeoExperimentsView } from './components/GeoExperimentsView';
import { ParentMeetingSupport } from './components/ParentMeetingSupport';
import { LoginModal } from './components/LoginModal';
import { UserManagementModal } from './components/UserManagementModal';
import StudentPickerManager from './components/StudentPickerManager';
import ClassroomTimerManager from './components/ClassroomTimerManager';
import { AiSystemAssistantModal } from './components/AiSystemAssistantModal';
import { FloatingAiAssistantWidget } from './components/FloatingAiAssistantWidget';
import { AICoPilotWidget } from './components/AICoPilotWidget';
import { AISettingsModal } from './components/AISettingsModal';
import { AIQuestionGeneratorModal } from './components/AIQuestionGeneratorModal';
import { StorageService } from './services/storage';
import { IDBStorageService } from './services/idbStorage';

export function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    StorageService.init();
    return StorageService.getCurrentUser();
  });
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam) return tabParam;

      const hash = window.location.hash.replace('#', '').trim();
      if (hash) return hash;
    } catch (e) {}
    return 'catalog';
  });

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    try {
      if (window.location.hash !== `#${newTab}`) {
        window.location.hash = newTab;
      }
    } catch (e) {}
  };

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
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [editingGameTemplate, setEditingGameTemplate] = useState(null);
  const [playingGame, setPlayingGame] = useState(null);

  const handleApplyAIGameQuestions = (aiQuestions) => {
    if (!aiQuestions || aiQuestions.length === 0) return;
    const newAiGame = {
      id: `game_ai_${Date.now()}`,
      title: `Game AI - ${new Date().toLocaleDateString('vi-VN')}`,
      subject: 'Địa Lí',
      grade: '6',
      gameType: 'dua-vit',
      questions: aiQuestions,
      userId: currentUser?.id || 'user_admin',
      isCustomized: true,
      updatedAt: new Date().toISOString()
    };
    StorageService.saveTeacherGame(newAiGame);
    setSavedGames(prev => [newAiGame, ...prev]);
    alert(`🎉 Đã nạp thành công ${aiQuestions.length} câu hỏi AI vào Kho Game của tôi! Thầy/cô có thể bấm chơi ngay lập tức.`);
  };

  // Sync body class for playing game view
  useEffect(() => {
    if (playingGame) {
      document.body.classList.add('is-game-playing');
    } else {
      document.body.classList.remove('is-game-playing');
    }
    return () => {
      document.body.classList.remove('is-game-playing');
    };
  }, [playingGame]);

  // Sync body class for browser native fullscreen mode
  useEffect(() => {
    const handleFSChange = () => {
      if (document.fullscreenElement) {
        document.body.classList.add('is-fullscreen');
      } else {
        document.body.classList.remove('is-fullscreen');
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  // Initial Load & URL Hash Sync
  useEffect(() => {
    StorageService.init();
    loadAllData();

    const handleHashOrStateChange = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const tabParam = searchParams.get('tab');
        if (tabParam) {
          setActiveTabState(tabParam);
          return;
        }

        const hash = window.location.hash.replace('#', '').trim();
        if (hash) {
          setActiveTabState(hash);
        }
      } catch (e) {}
    };

    window.addEventListener('hashchange', handleHashOrStateChange);
    window.addEventListener('popstate', handleHashOrStateChange);
    return () => {
      window.removeEventListener('hashchange', handleHashOrStateChange);
      window.removeEventListener('popstate', handleHashOrStateChange);
    };
  }, []);

  const loadAllData = async () => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setBaseGames(StorageService.getBaseGames());
      
      // 1. Instant sync load from RAM / LocalStorage
      const localGames = StorageService.getTeacherSavedGames(user?.id);
      setSavedGames(localGames);
      
      // 2. Await full IndexedDB & Cloud sync to guarantee zero data loss on F5 page refresh
      try {
        const syncedGames = await StorageService.syncWithIndexedDB(user?.id);
        if (Array.isArray(syncedGames)) {
          setSavedGames(syncedGames);
        }
      } catch (e) {
        console.warn("loadAllData syncWithIndexedDB error:", e);
      }
    }
  };

  const handleLoginSuccess = async (loggedInUser) => {
    setCurrentUser(loggedInUser);
    setBaseGames(StorageService.getBaseGames());
    const localGames = StorageService.getTeacherSavedGames(loggedInUser?.id);
    setSavedGames(localGames);
    try {
      const syncedGames = await StorageService.syncWithIndexedDB(loggedInUser?.id);
      if (Array.isArray(syncedGames)) {
        setSavedGames(syncedGames);
      }
    } catch (e) {}
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

  const handleDeleteSavedGame = (gameOrId) => {
    const activeUserId = currentUser?.id || StorageService.getCurrentUser()?.id || 'user_admin';
    const gameId = (gameOrId && typeof gameOrId === 'object') ? gameOrId.id : gameOrId;
    if (!gameId) return;

    if (window.confirm('Bạn có chắc chắn muốn xóa game này khỏi Kho Game Của Tôi không?')) {
      StorageService.deleteTeacherSavedGame(activeUserId, gameId);
      const updatedGames = StorageService.getTeacherSavedGames(activeUserId);
      setSavedGames(updatedGames);
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

  const filteredBaseGames = (baseGames || []).filter(game => {
    if (!game || typeof game !== 'object') return false;
    const gCategory = game.category || '';
    const gSubject = game.subject || '';
    const matchesCategory = selectedCategory === 'Tất cả' || 
                            gCategory === selectedCategory || 
                            gSubject === selectedCategory;

    const sTerm = (searchTerm || '').trim().toLowerCase();
    const gTitle = String(game.title || game.name || game.lessonTitle || '').toLowerCase();
    const gDesc = String(game.description || '').toLowerCase();
    const gTags = Array.isArray(game.tags) ? game.tags : [];

    const matchesSearch = !sTerm || 
                          gTitle.includes(sTerm) || 
                          gDesc.includes(sTerm) ||
                          gTags.some(t => String(t || '').toLowerCase().includes(sTerm));
    return matchesCategory && matchesSearch;
  });

  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout-wrapper">
      
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
                ĐỒ NGHỀ DẠY HỌC
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
              <span>{currentUser ? (String(currentUser.name || currentUser.username || 'Tài Khoản').split(' ').pop() || 'Tài Khoản') : 'Đăng Nhập'}</span>
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
            
            {/* Ultra-Modern Hero AI Hub Banner (Option 2) */}
            <div className="hero-ai-hub">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#ffffff', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)' }}>
                    <Sparkles size={16} color="#fbbf24" /> AI EDUCATIONAL WORKSPACE
                  </div>
                  <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
                    Chào mừng <span style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{currentUser?.name || 'Thầy/Cô'}</span> trở lại! 👋
                  </h1>
                  <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '6px', maxWidth: '640px', fontWeight: 600 }}>
                    Hệ thống cung cấp kho game giáo dục 3D tương tác, tự động hóa tạo bài tập/bài giảng kết hợp công nghệ AI đỉnh cao.
                  </p>
                </div>

                {/* AI Quick Hub Action Cards */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setActiveTab('my-games')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '16px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <BookmarkCheck size={18} /> Kho Game Của Tôi ({savedGames.length})
                  </button>

                  <button 
                    onClick={() => setIsAdminCreateGameOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '16px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(2, 132, 199, 0.3)',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <Sparkles size={18} color="#fde047" /> AI Tạo Bài Tập Mới
                  </button>
                </div>
              </div>
            </div>

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
                    if (template.engineType === 'geo-3d-model' || template.id === 'geo-3d-experiments-game') {
                      setActiveTab('geo-experiments');
                      return;
                    }
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

        {/* View 2: Gọi Tên Học Sinh (Student Picker System) */}
        {activeTab === 'call-student' && (
          <StudentPickerManager 
            currentUser={currentUser} 
            onPlay={(game) => {
              if (game.engineType === 'geo-3d-model' || game.id === 'geo-3d-experiments-game') {
                setActiveTab('geo-experiments');
                return;
              }
              StorageService.incrementPlayCount(game.id, false);
              setBaseGames(StorageService.getBaseGames());
              setPlayingGame(game);
            }}
            onCustomize={(template) => setEditingGameTemplate(template)}
            onNavigateToHomeroom={() => setActiveTab('homeroom')}
          />
        )}

        {/* View 3: Đồng Hồ Bấm Giờ (Classroom Timer Manager) */}
        {activeTab === 'timer' && (
          <ClassroomTimerManager />
        )}

        {/* View 3: Lớp Chủ Nhiệm (Homeroom Management System) */}
        {activeTab === 'homeroom' && (
          <HomeroomManager currentUser={currentUser} />
        )}

        {/* View 4: Kho Game Của Tôi (Teacher Saved Library) */}
        {activeTab === 'my-games' && (
          <TeacherLibrary 
            savedGames={savedGames}
            currentUser={currentUser}
            onPlayGame={(savedGame) => {
              if (savedGame.engineType === 'geo-3d-model' || savedGame.baseGameId === 'geo-3d-experiments-game') {
                setActiveTab('geo-experiments');
                return;
              }
              StorageService.incrementPlayCount(savedGame.id, true);
              setSavedGames(StorageService.getTeacherSavedGames(currentUser?.id));
              setPlayingGame(savedGame);
            }}
            onEditGame={(savedGame) => setEditingGameTemplate(savedGame)}
            onDeleteGame={handleDeleteSavedGame}
            onBrowseCatalog={() => setActiveTab('catalog')}
            onUpdateLessonTitle={handleUpdateLessonTitle}
            onRefreshGames={(synced) => setSavedGames(synced)}
            onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
          />
        )}

        {/* View 5: Tải File SGK (Textbook Catalog Manager) */}
        {activeTab === 'textbook-download' && (
          <TextbookDownloadManager 
            searchTerm={searchTerm} 
            onOpenVirtualLab={() => setActiveTab('virtual-lab')} 
            onOpenGeoExperiments={() => setActiveTab('geo-experiments')}
          />
        )}

        {/* View 5.5: Thí Nghiệm Trực Quan (Virtual Lab Manager) */}
        {activeTab === 'virtual-lab' && (
          <VirtualLabManager currentUser={currentUser} onOpenGeoExperiments={() => setActiveTab('geo-experiments')} />
        )}


        {/* View 5.8: Thí Nghiệm Địa Lý 6 (Dedicated Geography Experiments View) */}
        {activeTab === 'geo-experiments' && (
          <GeoExperimentsView currentUser={currentUser} />
        )}

        {/* View 6: Slide Bài Giảng (Lecture Slide Manager) */}
        {activeTab === 'lecture-slides' && (
          <LectureSlideManager searchTerm={searchTerm} currentUser={currentUser} />
        )}

        {/* View 6.5: Hỗ Trợ Họp Phụ Huynh (Parent-Teacher Meeting Support) */}
        {activeTab === 'parent-meeting' && (
          <ParentMeetingSupport currentUser={currentUser} />
        )}

        {/* View 7: Quản Trị Admin */}
        {activeTab === 'admin' && (currentUser?.role === 'admin' || currentUser?.username === 'philthienhao' || currentUser?.id === 'user_admin') && (
          <AdminPanel 
            baseGames={baseGames}
            onAddGame={handleAdminAddGame}
            onDeleteGame={handleDeleteBaseGame}
            onOpenUserManagement={() => setIsUserManagementOpen(true)}
            onOpenCreateGame={() => setIsAdminCreateGameOpen(true)}
          />
        )}

        {/* Footer */}
        <footer style={{ padding: '24px', textAlign: 'center', color: '#334155', fontSize: '0.92rem', fontWeight: 600, borderTop: '1.5px solid rgba(13, 148, 136, 0.2)', marginTop: '40px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '16px' }}>
          <p style={{ margin: 0 }}>© 2026 <strong style={{ color: '#0f172a' }}>HỆ THỐNG HỖ TRỢ DẠY VÀ HỌC</strong> • Tác giả: <strong style={{ color: '#0d9488', fontWeight: 900 }}>Thầy Hảo Địa Lý</strong> | 📱 Zalo hỗ trợ: <a href="https://zalo.me/0387806954" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 900 }}>0387806954</a></p>
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
          currentUser={currentUser}
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
          className={`mobile-nav-item ${activeTab === 'call-student' ? 'active' : ''}`}
          onClick={() => setActiveTab('call-student')}
        >
          <UserCheck size={20} />
          <span>Gọi Tên</span>
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          <Clock size={20} />
          <span>Bấm Giờ</span>
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
          className={`mobile-nav-item ${activeTab === 'textbook-download' || activeTab === 'sgk' ? 'active' : ''}`}
          onClick={() => setActiveTab('textbook-download')}
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
            background: '#ffffff',
            border: '1.5px solid rgba(13, 148, 136, 0.35)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
            color: '#0f172a',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setIsMobileAccountOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                color: '#475569',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 800
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
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)',
                border: '3px solid #00a896'
              }}>
                {currentUser?.name?.charAt(0) || '👤'}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {currentUser?.name || 'Giáo Viên'}
              </h3>
              <span className={currentUser?.role === 'admin' ? 'badge badge-admin' : 'badge badge-teacher'} style={{ fontSize: '0.75rem', marginTop: '6px', display: 'inline-block' }}>
                {currentUser?.role === 'admin' ? 'Quyền Admin' : 'Tài Khoản Giáo Viên'}
              </span>
            </div>

            {/* Account Information Details */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#475569', fontWeight: 700 }}>Tên đăng nhập:</span>
                <span style={{ fontWeight: 800, color: '#0284c7' }}>{currentUser?.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#475569', fontWeight: 700 }}>Môn giảng dạy:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{currentUser?.subject || 'Giáo dục'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569', fontWeight: 700 }}>Trường học:</span>
                <span style={{ fontWeight: 800, color: '#d97706' }}>{currentUser?.school || 'Hệ Thống Hỗ Trợ Dạy Và Học'}</span>
              </div>
            </div>

            {/* Author Profile Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.06) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
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
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #d97706', objectFit: 'cover' }} 
              />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 800 }}>TÁC GIẢ WEBSITE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>Thầy Hảo Địa Lí</div>
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

      {/* Omnipresent Gemini AI Co-Pilot Widget */}
      <AICoPilotWidget 
        activeTab={activeTab}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        onApplyAIGameQuestions={handleApplyAIGameQuestions}
      />

      {/* Gemini AI Settings Modal */}
      <AISettingsModal 
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />

      {/* Zero-File AI Question Generator Modal */}
      <AIQuestionGeneratorModal 
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onApplyQuestions={handleApplyAIGameQuestions}
      />

      {/* Floating AI System Assistant & Contact Widget */}
      <FloatingAiAssistantWidget 
        onOpenSearchModal={() => setIsAiWidgetOpen(true)}
      />

      {/* Interactive AI System Assistant & FAQ Search Modal */}
      <AiSystemAssistantModal 
        isOpen={isAiWidgetOpen}
        onClose={() => setIsAiWidgetOpen(false)}
        currentUser={currentUser}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onPlayGame={(gameObj) => setPlayingGame(gameObj)}
        onOpenAdminCreateGame={() => setIsAdminCreateGameOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        savedGames={savedGames}
      />

    </div>
  );
}
