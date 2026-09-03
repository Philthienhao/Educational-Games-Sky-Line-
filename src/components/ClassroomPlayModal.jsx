import React, { useState } from 'react';
import { X, Maximize, Minimize, Plus, Trash2, Edit3, Users, Settings, Trophy, Sparkles, GraduationCap } from 'lucide-react';
import { WheelOfFortuneGame } from './games/WheelOfFortuneGame';
import { TugOfWarGame } from './games/TugOfWarGame';
import { MillionaireGame } from './games/MillionaireGame';
import { MysteryBoxGame } from './games/MysteryBoxGame';
import { PictureFlipGame } from './games/PictureFlipGame';
import { CrosswordGame } from './games/CrosswordGame';
import { KnowledgeTrainGame } from './games/KnowledgeTrainGame';
import { FlashcardGame } from './games/FlashcardGame';
import { FruitNinjaGame } from './games/FruitNinjaGame';
import { CarRaceGame } from './games/CarRaceGame';
import { MinesweeperGame } from './games/MinesweeperGame';
import { FlyingWordsGame } from './games/FlyingWordsGame';
import { MatchingPairsGame } from './games/MatchingPairsGame';
import { DuckRaceGame } from './games/DuckRaceGame';
import { TurtleRaceGame } from './games/TurtleRaceGame';
import { JungleRescueGame } from './games/JungleRescueGame';
import { TugOfWarDualGame } from './games/TugOfWarDualGame';
import { JeopardyGame } from './games/JeopardyGame';
import { HeadTiltGame } from './games/HeadTiltGame';
import { PoseImitationGame } from './games/PoseImitationGame';

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

export function ClassroomPlayModal({ game, onClose }) {
  if (!game) return null;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false);

  // Active turn team index state
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  // Dynamic Teams Scoreboard State
  const [teams, setTeams] = useState([
    { id: 't1', name: 'Đội 1 (Đỏ)', score: 0, color: '#ef4444' },
    { id: 't2', name: 'Đội 2 (Xanh)', score: 0, color: '#3b82f6' },
    { id: 't3', name: 'Đội 3 (Vàng)', score: 0, color: '#f59e0b' },
    { id: 't4', name: 'Đội 4 (Lục)', score: 0, color: '#10b981' }
  ]);

  const questions = game.questions || game.defaultQuestions || [];
  const engineType = game.engineType || 'tug-of-war';

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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const commonProps = {
    questions,
    teams,
    setTeams,
    onAddPoints: handleAddPoints,
    onRenameTeam: handleRenameTeam,
    activeTeamIndex,
    setActiveTeamIndex
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
        component = <DuckRaceGame {...commonProps} onClose={onClose} />;
        break;
      case 'turtle-race':
        component = <TurtleRaceGame {...commonProps} onClose={onClose} />;
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
      default:
        component = <WheelOfFortuneGame {...commonProps} />;
        break;
    }

    return (
      <GameErrorBoundary key={engineType}>
        {component}
      </GameErrorBoundary>
    );
  };

  if (engineType === 'duck-race' || engineType === 'turtle-race' || engineType === 'jungle-rescue') {
    return (
      <GameErrorBoundary key={engineType}>
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#0f172a',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {engineType === 'duck-race' ? (
            <DuckRaceGame {...commonProps} onClose={onClose} />
          ) : engineType === 'turtle-race' ? (
            <TurtleRaceGame {...commonProps} onClose={onClose} />
          ) : (
            <JungleRescueGame {...commonProps} onClose={onClose} />
          )}
        </div>
      </GameErrorBoundary>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0b0f19',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
      zIndex: 3000,
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
                {game.icon || '🎮'} {game.title}
              </h2>
              <span className="badge" style={{ background: '#00a896', color: '#fff', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                TRÌNH CHIẾU LỚP HỌC
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Môn: {game.subject || 'Tổng hợp'} • {questions.length} câu hỏi
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {engineType !== 'duck-race' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowTeamManager(true)}
              style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#c4b5fd' }}
            >
              <Users size={16} />
              ⚙️ Cấu Hình Đội Chơi ({teams.length} đội)
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
            onClick={onClose}
          >
            <X size={16} />
            Thoát Trình Chiếu
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

    </div>
  );
}
