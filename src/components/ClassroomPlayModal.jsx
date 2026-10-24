import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Maximize, Minimize, Plus, Trash2, Edit3, Users, Settings, Trophy, Sparkles, GraduationCap, Clock, Share2 } from 'lucide-react';
// Code-Split Game Engines: dynamically loaded on demand with React.lazy
const WheelOfFortuneGame = React.lazy(() => import('./games/WheelOfFortuneGame').then(m => ({ default: m.WheelOfFortuneGame || m.default })));
const TugOfWarGame = React.lazy(() => import('./games/TugOfWarGame').then(m => ({ default: m.TugOfWarGame || m.default })));
const MillionaireGame = React.lazy(() => import('./games/MillionaireGame').then(m => ({ default: m.MillionaireGame || m.default })));
const MysteryBoxGame = React.lazy(() => import('./games/MysteryBoxGame').then(m => ({ default: m.MysteryBoxGame || m.default })));
const PictureFlipGame = React.lazy(() => import('./games/PictureFlipGame').then(m => ({ default: m.PictureFlipGame || m.default })));
const CrosswordGame = React.lazy(() => import('./games/CrosswordGame').then(m => ({ default: m.CrosswordGame || m.default })));
const KnowledgeTrainGame = React.lazy(() => import('./games/KnowledgeTrainGame').then(m => ({ default: m.KnowledgeTrainGame || m.default })));
const FlashcardGame = React.lazy(() => import('./games/FlashcardGame').then(m => ({ default: m.FlashcardGame || m.default })));
const FruitNinjaGame = React.lazy(() => import('./games/FruitNinjaGame').then(m => ({ default: m.FruitNinjaGame || m.default })));
const CarRaceGame = React.lazy(() => import('./games/CarRaceGame').then(m => ({ default: m.CarRaceGame || m.default })));
const MinesweeperGame = React.lazy(() => import('./games/MinesweeperGame').then(m => ({ default: m.MinesweeperGame || m.default })));
const FlyingWordsGame = React.lazy(() => import('./games/FlyingWordsGame').then(m => ({ default: m.FlyingWordsGame || m.default })));
const MatchingPairsGame = React.lazy(() => import('./games/MatchingPairsGame').then(m => ({ default: m.MatchingPairsGame || m.default })));
const DuckRaceGame = React.lazy(() => import('./games/DuckRaceGame').then(m => ({ default: m.DuckRaceGame || m.default })));
const TurtleRaceGame = React.lazy(() => import('./games/TurtleRaceGame').then(m => ({ default: m.TurtleRaceGame || m.default })));
const JungleRescueGame = React.lazy(() => import('./games/JungleRescueGame').then(m => ({ default: m.JungleRescueGame || m.default })));
const TugOfWarDualGame = React.lazy(() => import('./games/TugOfWarDualGame').then(m => ({ default: m.TugOfWarDualGame || m.default })));
const JeopardyGame = React.lazy(() => import('./games/JeopardyGame').then(m => ({ default: m.JeopardyGame || m.default })));
const HeadTiltGame = React.lazy(() => import('./games/HeadTiltGame').then(m => ({ default: m.HeadTiltGame || m.default })));
const PoseImitationGame = React.lazy(() => import('./games/PoseImitationGame').then(m => ({ default: m.PoseImitationGame || m.default })));
const ClawMachineGame = React.lazy(() => import('./games/ClawMachineGame').then(m => ({ default: m.ClawMachineGame || m.default })));
const AstronautExplorerGame = React.lazy(() => import('./games/AstronautExplorerGame').then(m => ({ default: m.AstronautExplorerGame || m.default })));
const MagicHatGame = React.lazy(() => import('./games/MagicHatGame').then(m => ({ default: m.MagicHatGame || m.default })));
const MagicGrimoireGame = React.lazy(() => import('./games/MagicGrimoireGame').then(m => ({ default: m.MagicGrimoireGame || m.default })));
const TowerBuilderGame = React.lazy(() => import('./games/TowerBuilderGame').then(m => ({ default: m.TowerBuilderGame || m.default })));
const MarioRaceGame = React.lazy(() => import('./games/MarioRaceGame').then(m => ({ default: m.MarioRaceGame || m.default })));
const IndoorPEDanceGame = React.lazy(() => import('./games/IndoorPEDanceGame').then(m => ({ default: m.IndoorPEDanceGame || m.default })));
const BouncingWordsGame = React.lazy(() => import('./games/BouncingWordsGame').then(m => ({ default: m.BouncingWordsGame || m.default })));
const MathSackRaceGame = React.lazy(() => import('./games/MathSackRaceGame').then(m => ({ default: m.MathSackRaceGame || m.default })));
const PirateShipBattleGame = React.lazy(() => import('./games/PirateShipBattleGame').then(m => ({ default: m.PirateShipBattleGame || m.default })));
const ClassroomTimerGame = React.lazy(() => import('./games/ClassroomTimerGame').then(m => ({ default: m.ClassroomTimerGame || m.default })));
const GeoExperimentsView = React.lazy(() => import('./GeoExperimentsView').then(m => ({ default: m.GeoExperimentsView || m.default })));
const InteractiveExperimentCanvas = React.lazy(() => import('./experiments/InteractiveExperimentCanvas').then(m => ({ default: m.InteractiveExperimentCanvas || m.default })));
const StudentGroupDividerGame = React.lazy(() => import('./games/StudentGroupDividerGame').then(m => ({ default: m.StudentGroupDividerGame || m.default })));
const MarbleRaceGame = React.lazy(() => import('./games/MarbleRaceGame').then(m => ({ default: m.MarbleRaceGame || m.default })));
const MosquitoSlayerGame = React.lazy(() => import('./games/MosquitoSlayerGame').then(m => ({ default: m.MosquitoSlayerGame || m.default })));
const HeartPuzzle2010Game = React.lazy(() => import('./games/HeartPuzzle2010Game').then(m => ({ default: m.HeartPuzzle2010Game || m.default })));

function GameLoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      minHeight: '340px',
      color: '#ffffff',
      gap: '16px',
      padding: '40px'
    }}>
      <div style={{
        width: '46px',
        height: '46px',
        border: '4px solid rgba(255, 255, 255, 0.2)',
        borderTopColor: '#00a896',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
        Đang khởi động trò chơi...
      </span>
    </div>
  );
}

const TEAM_COLORS = [
  '#ef4444', '#3b82f6', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'
];

// Top-level ErrorBoundary for Games
class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error("Game Engine caught error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', textAlign: 'center', color: '#fff', width: '100%' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#fbbf24', marginBottom: '12px', fontWeight: 900 }}>
            ⚠️ Trò Chơi Vừa Được Tự Động Khôi Phục
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
            Hệ thống đã ngăn chặn thành công lỗi đứng màn hình. Thầy cô bấm nút bên dưới để chơi tiếp:
          </p>
          <button 
            className="btn btn-accent btn-lg"
            onClick={() => this.setState({ hasError: false })}
            style={{ borderRadius: '20px', padding: '12px 30px' }}
          >
            🔄 Khôi Phục & Tiếp Tục Chơi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ClassroomPlayModal({ 
  game, 
  onClose, 
  currentUser,
  isHomework = false,
  studentName = '',
  studentClass = '',
  onHomeworkFinish = null,
  onAssignHomework = null,
  onHostLive = null
}) {
  if (!game) return null;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false);

  useEffect(() => {
    document.body.classList.add('is-modal-open', 'is-game-playing', 'is-fullscreen');
    try {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        }
      }
    } catch (e) {}
    setIsFullscreen(true);

    const handleFSChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);

    return () => {
      document.body.classList.remove('is-modal-open', 'is-game-playing', 'is-fullscreen');
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      } catch (e) {}
    };
  }, []);

  // Active turn team index state
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isHomework) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isHomework]);

  // Dynamic Teams Scoreboard State
  const [teams, setTeams] = useState(() => {
    if (isHomework && studentName) {
      return [
        { id: 't1', name: `${studentName} (Em)`, score: 0, color: '#ef4444' },
        { id: 't2', name: 'Đội 2 (Xanh)', score: 0, color: '#3b82f6' },
        { id: 't3', name: 'Đội 3 (Vàng)', score: 0, color: '#f59e0b' },
        { id: 't4', name: 'Đội 4 (Lục)', score: 0, color: '#10b981' }
      ];
    }
    return [
      { id: 't1', name: 'Đội 1 (Đỏ)', score: 0, color: '#ef4444' },
      { id: 't2', name: 'Đội 2 (Xanh)', score: 0, color: '#3b82f6' },
      { id: 't3', name: 'Đội 3 (Vàng)', score: 0, color: '#f59e0b' },
      { id: 't4', name: 'Đội 4 (Lục)', score: 0, color: '#10b981' }
    ];
  });

  const questions = game.questions || game.defaultQuestions || [];
  let engineType = game.engineType || game.gameType;
  if (!engineType || engineType === 'tug-of-war-dual') {
    const rawId = String(game.baseGameId || game.id || '').toLowerCase();
    const rawTitle = String(game.title || '').toLowerCase();
    if (rawId.includes('duck-race') || rawTitle.includes('đua vịt') || rawTitle.includes('dua vit')) {
      engineType = 'duck-race';
    } else if (rawId.includes('turtle-race') || rawTitle.includes('đua rùa') || rawTitle.includes('dua rua')) {
      engineType = 'turtle-race';
    } else if (rawId.includes('marble-race') || rawTitle.includes('đua bi') || rawTitle.includes('dua bi')) {
      engineType = 'marble-race';
    } else if (rawId.includes('claw-machine') || rawTitle.includes('gắp thú') || rawTitle.includes('gap thu')) {
      engineType = 'claw-machine';
    } else if (rawId.includes('astronaut') || rawTitle.includes('phi hành gia') || rawTitle.includes('vũ trụ')) {
      engineType = 'astronaut-explorer';
    } else if (rawId.includes('magic-hat') || rawTitle.includes('mũ kỳ diệu') || rawTitle.includes('chiếc mũ')) {
      engineType = 'magic-hat';
    } else if (rawId.includes('magic-grimoire') || rawTitle.includes('cổ thư') || rawTitle.includes('sách ma thuật')) {
      engineType = 'magic-grimoire';
    } else if (rawId.includes('group-divider') || rawTitle.includes('chia nhóm')) {
      engineType = 'student-group-divider';
    } else if (rawId.includes('2010') || rawId.includes('heart-puzzle') || rawId.includes('heart-reveal') || rawTitle.includes('20/10') || rawTitle.includes('mẹ yêu con') || rawTitle.includes('phụ nữ việt nam') || rawTitle.includes('giải mã bức tranh 20/10')) {
      engineType = 'heart-reveal-2010';
    } else if (rawId.includes('pirate') || rawTitle.includes('cướp biển') || rawTitle.includes('cuop bien') || rawTitle.includes('tàu cướp biển')) {
      engineType = 'pirate-ship-battle';
    } else if (rawId.includes('mario') || rawTitle.includes('mario')) {
      engineType = 'mario-race';
    } else if (rawId.includes('tower') || rawTitle.includes('tháp') || rawTitle.includes('kiến trúc sư')) {
      engineType = 'tower-builder';
    } else if (rawId.includes('mosquito') || rawTitle.includes('diệt muỗi') || rawTitle.includes('muỗi')) {
      engineType = 'mosquito-slayer';
    } else if (rawId.includes('bouncing') || rawTitle.includes('bóng nảy')) {
      engineType = 'bouncing-words';
    } else if (rawId.includes('sack') || rawTitle.includes('nhảy bao bố')) {
      engineType = 'math-sack-race';
    } else if (!engineType) {
      engineType = 'tug-of-war-dual';
    }
  }

  const handleAddPoints = (teamIndex, points) => {
    const targetIdx = (typeof teamIndex === 'number' && teamIndex >= 0) ? teamIndex : activeTeamIndex;
    setTeams(prev => prev.map((t, idx) => idx === targetIdx ? { ...t, score: t.score + points } : t));
  };

  const handleAdjustPoints = (teamIndex, delta) => {
    setTeams(prev => prev.map((t, idx) => idx === teamIndex ? { ...t, score: Math.max(0, t.score + delta) } : t));
  };

  const handleAddTeam = () => {
    const nextIdx = teams.length;
    const newTeam = {
      id: `t_${Date.now()}`,
      name: `Đội ${nextIdx + 1}`,
      score: 0,
      color: TEAM_COLORS[nextIdx % TEAM_COLORS.length]
    };
    setTeams([...teams, newTeam]);
  };

  const handleRemoveTeam = (idx) => {
    if (teams.length <= 1) {
      alert('Phải giữ lại ít nhất 1 đội chơi.');
      return;
    }
    setTeams(teams.filter((_, i) => i !== idx));
  };

  const handleRenameTeam = (idx, newName) => {
    setTeams(prev => prev.map((t, i) => i === idx ? { ...t, name: newName } : t));
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (e) {}
  };

  const commonProps = {
    questions,
    teams,
    setTeams,
    onAddPoints: handleAddPoints,
    onRenameTeam: handleRenameTeam,
    activeTeamIndex,
    setActiveTeamIndex,
    onClose
  };

  const renderGameEngine = () => {
    let component = null;
    switch (engineType) {
      case 'wheel':
        component = <WheelOfFortuneGame {...commonProps} />;
        break;
      case 'tug-of-war':
        component = <TugOfWarGame {...commonProps} />;
        break;
      case 'tug-of-war-dual':
        component = <TugOfWarDualGame {...commonProps} />;
        break;
      case 'millionaire':
        component = <MillionaireGame {...commonProps} />;
        break;
      case 'mystery-box':
        component = <MysteryBoxGame {...commonProps} />;
        break;
      case 'picture-reveal':
        component = <PictureFlipGame {...commonProps} game={game} secretImage={game?.secretImage || game?.bgImageUrl} />;
        break;
      case 'crossword':
        component = <CrosswordGame {...commonProps} />;
        break;
      case 'train':
        component = <KnowledgeTrainGame {...commonProps} />;
        break;
      case 'flashcard':
        component = <FlashcardGame {...commonProps} />;
        break;
      case 'fruit-ninja':
        component = <FruitNinjaGame {...commonProps} />;
        break;
      case 'car-race':
        component = <CarRaceGame {...commonProps} />;
        break;
      case 'minesweeper':
        component = <MinesweeperGame {...commonProps} />;
        break;
      case 'flying-words':
        component = <FlyingWordsGame {...commonProps} />;
        break;
      case 'matching-pairs':
        component = <MatchingPairsGame {...commonProps} />;
        break;
      case 'duck-race':
        component = <DuckRaceGame {...commonProps} game={game} currentUser={currentUser} onClose={onClose} />;
        break;
      case 'turtle-race':
        component = <TurtleRaceGame {...commonProps} game={game} currentUser={currentUser} onClose={onClose} />;
        break;
      case 'jungle-rescue':
        component = <JungleRescueGame {...commonProps} onClose={onClose} />;
        break;
      case 'jeopardy':
        component = <JeopardyGame {...commonProps} title={game?.title} subtitle={game?.subtitle} />;
        break;
      case 'head-tilt':
        component = <HeadTiltGame {...commonProps} onClose={onClose} />;
        break;
      case 'pose-imitation':
        component = <PoseImitationGame {...commonProps} onClose={onClose} lessonTitle={game?.lessonTitle} title={game?.title} />;
        break;
      case 'tower-builder':
        component = <TowerBuilderGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} onHostLive={onHostLive} />;
        break;
      case 'mario-race':
        component = <MarioRaceGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} onHostLive={onHostLive} />;
        break;
      case 'indoor-pe-dance':
        component = <IndoorPEDanceGame {...commonProps} title={game?.title} onClose={onClose} />;
        break;
      case 'mosquito-slayer':
        component = <MosquitoSlayerGame {...commonProps} game={game} onClose={onClose} />;
        break;
      case 'bouncing-words':
        component = <BouncingWordsGame {...commonProps} game={game} onClose={onClose} />;
        break;
      case 'math-sack-race':
        component = <MathSackRaceGame {...commonProps} game={game} onClose={onClose} />;
        break;
      case 'pirate-ship-battle':
        component = <PirateShipBattleGame {...commonProps} game={game} onClose={onClose} />;
        break;
      case 'classroom-timer':
        component = <ClassroomTimerGame onClose={onClose} />;
        break;
      case 'geo-3d-model':
      case 'geo_earth_structure':
      case 'geo-earth-structure-game':
      case 'geo_6_06':
      case 'exp_geo_6_06':
        if (game?.interactiveType || game?.id === 'exp_geo_6_06' || game?.id === 'geo-earth-structure-game' || game?.baseGameId === 'geo-earth-structure-game' || (game?.title && (game.title.includes('Cấu Tạo') || game.title.includes('Trái Đất')))) {
          const exp = { ...game, interactiveType: game.interactiveType || 'geo_earth_structure', isGeo: true };
          component = <InteractiveExperimentCanvas experiment={exp} onClose={onClose} />;
        } else {
          component = <GeoExperimentsView currentUser={currentUser} onClose={onClose} />;
        }
        break;
      case 'student-group-divider':
        component = <StudentGroupDividerGame game={game} onClose={onClose} currentUser={currentUser} />;
        break;
      case 'marble-race':
        component = <MarbleRaceGame onClose={onClose} currentUser={currentUser} onAddPoints={handleAddPoints} />;
        break;
      case 'heart-reveal-2010':
      case 'heart-puzzle-2010':
        component = <HeartPuzzle2010Game {...commonProps} game={game} onClose={onClose} />;
        break;
      default:
        component = <WheelOfFortuneGame {...commonProps} />;
        break;
    }

    return (
      <GameErrorBoundary key={engineType}>
        <React.Suspense fallback={<GameLoadingFallback />}>
          {component}
        </React.Suspense>
      </GameErrorBoundary>
    );
  };

  if (engineType === 'duck-race' || engineType === 'turtle-race' || engineType === 'claw-machine' || engineType === 'jungle-rescue' || engineType === 'astronaut-explorer' || engineType === 'magic-hat' || engineType === 'magic-grimoire' || engineType === 'tower-builder' || engineType === 'mario-race' || engineType === 'indoor-pe-dance' || engineType === 'mosquito-slayer' || engineType === 'geo-3d-model' || engineType === 'geo_earth_structure' || engineType === 'geo-earth-structure-game' || engineType === 'geo_6_06' || engineType === 'exp_geo_6_06' || engineType === 'bouncing-words' || engineType === 'math-sack-race' || engineType === 'pirate-ship-battle' || engineType === 'classroom-timer' || engineType === 'student-group-divider' || engineType === 'marble-race' || engineType === 'heart-reveal-2010' || engineType === 'heart-puzzle-2010') {
    return ReactDOM.createPortal(
      <GameErrorBoundary key={engineType}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 0,
          padding: 0,
          background: '#0f172a',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {isHomework && (
            <div style={{
              position: 'fixed',
              top: '12px',
              right: '16px',
              zIndex: 10000000,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1.5px solid rgba(0, 168, 150, 0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 800 }}>
                🏠 BTVN: <strong style={{ color: '#38bdf8' }}>{studentName}</strong> ({studentClass || 'Học sinh'})
              </span>
              <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {Math.floor(elapsedSeconds / 60)}:{elapsedSeconds % 60 < 10 ? '0' : ''}{elapsedSeconds % 60}
              </span>
              <button
                onClick={() => {
                  if (onHomeworkFinish) {
                    onHomeworkFinish({
                      score: teams[0]?.score || 100,
                      timeSpentSeconds: elapsedSeconds,
                      teams
                    });
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Trophy size={14} />
                <span>Nộp Bài & Xem Bảng Vàng</span>
              </button>
            </div>
          )}
          <React.Suspense fallback={<GameLoadingFallback />}>
            {engineType === 'duck-race' ? (
              <DuckRaceGame {...commonProps} game={game} currentUser={currentUser} onClose={onClose} />
            ) : engineType === 'turtle-race' ? (
              <TurtleRaceGame {...commonProps} game={game} currentUser={currentUser} onClose={onClose} />
            ) : engineType === 'claw-machine' ? (
              <ClawMachineGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} />
            ) : engineType === 'astronaut-explorer' ? (
              <AstronautExplorerGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} />
            ) : engineType === 'magic-hat' ? (
              <MagicHatGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} />
            ) : engineType === 'magic-grimoire' ? (
              <MagicGrimoireGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} />
            ) : engineType === 'tower-builder' ? (
              <TowerBuilderGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} />
            ) : engineType === 'mario-race' ? (
              <MarioRaceGame {...commonProps} game={game} onClose={onClose} currentUser={currentUser} />
            ) : engineType === 'indoor-pe-dance' ? (
              <IndoorPEDanceGame {...commonProps} title={game?.title} onClose={onClose} />
            ) : engineType === 'mosquito-slayer' ? (
              <MosquitoSlayerGame {...commonProps} game={game} onClose={onClose} />
            ) : engineType === 'jungle-rescue' ? (
              <JungleRescueGame {...commonProps} game={game} onClose={onClose} />
            ) : engineType === 'bouncing-words' ? (
              <BouncingWordsGame {...commonProps} game={game} onClose={onClose} />
            ) : engineType === 'math-sack-race' ? (
              <MathSackRaceGame {...commonProps} game={game} onClose={onClose} />
            ) : engineType === 'pirate-ship-battle' ? (
              <PirateShipBattleGame {...commonProps} game={game} onClose={onClose} />
            ) : engineType === 'classroom-timer' ? (
              <ClassroomTimerGame onClose={onClose} />
            ) : engineType === 'geo-3d-model' ? (
              <GeoExperimentsView currentUser={currentUser} onClose={onClose} />
            ) : engineType === 'student-group-divider' ? (
              <StudentGroupDividerGame game={game} onClose={onClose} currentUser={currentUser} />
            ) : engineType === 'marble-race' ? (
              <MarbleRaceGame {...commonProps} game={game} currentUser={currentUser} onClose={onClose} onAddPoints={handleAddPoints} />
            ) : (engineType === 'heart-reveal-2010' || engineType === 'heart-puzzle-2010') ? (
              <HeartPuzzle2010Game {...commonProps} game={game} onClose={onClose} />
            ) : (
              renderGameEngine()
            )}
          </React.Suspense>
        </div>
      </GameErrorBoundary>,
      document.body
    );
  }

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      margin: 0,
      padding: 0,
      background: '#0b0f19',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Top Presentation Header Controls */}
      <div style={{
        padding: '12px 24px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Game Title & Graduation Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            flexShrink: 0
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>
                {game.icon || '🎮'} {game.lessonTitle || game.title}
              </h2>
              {isHomework ? (
                <span className="badge" style={{ background: '#d97706', color: '#fff', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  🏠 BÀI TẬP VỀ NHÀ • {studentName.toUpperCase()} ({studentClass || 'HỌC SINH'})
                </span>
              ) : (
                <span className="badge" style={{ background: '#00a896', color: '#fff', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                  TRÌNH CHIẾU LỚP HỌC
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Môn: {game.teacherSubject || game.subject || 'Tổng hợp'} • {questions.length} câu hỏi
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isHomework && (
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '6px 12px',
                borderRadius: '10px',
                color: '#38bdf8',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Clock size={15} />
                <span>{Math.floor(elapsedSeconds / 60)}:{elapsedSeconds % 60 < 10 ? '0' : ''}{elapsedSeconds % 60}</span>
              </div>

              <button
                className="btn"
                onClick={() => {
                  if (onHomeworkFinish) {
                    onHomeworkFinish({
                      score: teams[0]?.score || 0,
                      timeSpentSeconds: elapsedSeconds,
                      teams
                    });
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  padding: '7px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Trophy size={16} color="#facc15" />
                <span>🏁 Nộp Bài & Xem Bảng Vàng</span>
              </button>
            </>
          )}

          {!isHomework && engineType !== 'duck-race' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowTeamManager(true)}
              style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#c4b5fd' }}
            >
              <Users size={16} />
              ⚙️ Cấu Hình Đội Chơi ({teams.length} đội)
            </button>
          )}

          {!isHomework && onHostLive && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onHostLive(game)}
              style={{ background: 'rgba(2, 132, 199, 0.25)', border: '1px solid #0284c7', color: '#7dd3fc', fontWeight: 800 }}
              title="Mở phòng đấu nhóm trực tiếp (Giáo viên làm máy chủ điều khiển, học sinh dùng điện thoại)"
            >
              <Users size={16} />
              🎮 Đấu Nhóm Live
            </button>
          )}

          {!isHomework && onAssignHomework && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onAssignHomework(game)}
              style={{ background: 'rgba(13, 148, 136, 0.25)', border: '1px solid #0d9488', color: '#5eead4', fontWeight: 800 }}
              title="Giao bài tập về nhà từ trò chơi này cho học sinh"
            >
              <Share2 size={16} />
              🚀 Giao Bài Về Nhà
            </button>
          )}

          <button 
            className="btn btn-secondary btn-sm"
            onClick={toggleFullscreen}
            title="Bật / Tắt Toàn màn hình"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            {isFullscreen ? 'Thoát Fullscreen' : 'Toàn Màn Hình'}
          </button>

          <button 
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (isHomework) {
                if (window.confirm("Em có muốn nộp bài tập và xem kết quả Bảng Vàng không?")) {
                  if (onHomeworkFinish) {
                    onHomeworkFinish({
                      score: teams[0]?.score || 0,
                      timeSpentSeconds: elapsedSeconds,
                      teams
                    });
                  } else {
                    onClose();
                  }
                }
              } else {
                onClose();
              }
            }}
          >
            <X size={16} />
            {isHomework ? 'Nộp & Thoát' : 'Thoát Trình Chiếu'}
          </button>
        </div>
      </div>

      {/* ALL TEAMS SCOREBOARD BAR - Hidden for Tug Of War, Head Tilt, Pose Imitation & Duck Race */}
      {engineType !== 'tug-of-war-dual' && engineType !== 'tug-of-war' && engineType !== 'head-tilt' && engineType !== 'pose-imitation' && engineType !== 'duck-race' && (
        <div style={{
          padding: '12px 24px',
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap'
        }}>
          {teams.map((team, idx) => {
            const isActive = activeTeamIndex === idx;

            return (
              <div
                key={team.id || idx}
                onClick={() => setActiveTeamIndex(idx)}
                title="Bấm để chọn lượt chơi cho đội này"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  background: isActive 
                    ? `linear-gradient(135deg, ${team.color}35 0%, rgba(15, 23, 42, 0.95) 100%)`
                    : 'rgba(15, 23, 42, 0.8)',
                  border: isActive ? `2.5px solid ${team.color}` : `1.5px solid ${team.color}60`,
                  boxShadow: isActive 
                    ? `0 0 22px ${team.color}, 0 4px 15px rgba(0,0,0,0.5)`
                    : `0 4px 12px ${team.color}25`,
                  transform: isActive ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Active Turn Badge */}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: team.color,
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    letterSpacing: '0.04em'
                  }}>
                    👑 ĐẾN LƯỢT
                  </span>
                )}

                <input 
                  type="text"
                  value={team.name}
                  onChange={(e) => handleRenameTeam(idx, e.target.value)}
                  title="Bấm để đổi tên đội trực tiếp"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: team.color,
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    outline: 'none',
                    width: '110px',
                    textAlign: 'center'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '10px' }}>
                  <span style={{ color: '#facc15', fontWeight: 900, fontSize: '0.95rem' }}>{team.score}đ</span>
                </div>

                <div style={{ display: 'flex', gap: '2px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAdjustPoints(idx, 50); }}
                    style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#6ee7b7', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    +50
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAdjustPoints(idx, -50); }}
                    style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fca5a5', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    -50
                  </button>
                </div>
              </div>
            );
          })}

          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleAddTeam}
            style={{ padding: '6px 12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid #10b981' }}
            title="Thêm đội chơi mới"
          >
            <Plus size={14} /> Thêm Đội
          </button>
        </div>
      )}

      {/* Main Presentation Stage */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {renderGameEngine()}
      </div>

      {/* Team Manager Modal */}
      {showTeamManager && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '580px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} color="#8b5cf6" />
                Cấu Hình Đội Chơi Lớp Học ({teams.length} Đội)
              </h3>
              <button onClick={() => setShowTeamManager(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Bạn có thể đổi tên đội, đặt lại điểm số hoặc thêm/bớt số lượng đội chơi tùy ý cho phù hợp với lớp học của bạn.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto', marginBottom: '20px' }}>
              {teams.map((t, idx) => (
                <div 
                  key={t.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${t.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    <input 
                      type="text"
                      value={t.name}
                      onChange={(e) => handleRenameTeam(idx, e.target.value)}
                      placeholder="Tên đội chơi..."
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        flex: 1
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Điểm:</span>
                      <input 
                        type="number"
                        value={t.score}
                        onChange={(e) => setTeams(teams.map((item, i) => i === idx ? { ...item, score: Number(e.target.value) || 0 } : item))}
                        style={{
                          width: '70px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          fontWeight: 800,
                          textAlign: 'center'
                        }}
                      />
                    </div>

                    <button 
                      onClick={() => handleRemoveTeam(idx)}
                      style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#fca5a5', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                      title="Xóa đội này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={handleAddTeam}
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid #10b981' }}
              >
                <Plus size={16} /> Thêm Đội Mới
              </button>

              <button 
                className="btn btn-primary"
                onClick={() => setShowTeamManager(false)}
              >
                Xong
              </button>
            </div>

          </div>
        </div>
      )}

    </div>,
    document.body
  );
}
