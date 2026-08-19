import React, { useState } from 'react';
import { X, Maximize, Minimize, Plus, Trash2, Edit3, Users, Settings, Trophy, Sparkles } from 'lucide-react';
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
import { TugOfWarDualGame } from './games/TugOfWarDualGame';

const TEAM_COLORS = [
  '#ef4444', '#3b82f6', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'
];

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
  const engineType = game.engineType || 'wheel';

  const handleAddPoints = (teamIndex, points) => {
    setTeams(prev => prev.map((t, idx) => idx === teamIndex ? { ...t, score: t.score + points } : t));
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

  const renderGameEngine = () => {
    const commonProps = {
      questions,
      teams,
      onAddPoints: handleAddPoints,
      activeTeamIndex,
      setActiveTeamIndex
    };

    switch (engineType) {
      case 'wheel':
        return <WheelOfFortuneGame {...commonProps} />;
      case 'tug-of-war':
        return <TugOfWarGame {...commonProps} />;
      case 'tug-of-war-dual':
        return <TugOfWarDualGame {...commonProps} />;
      case 'millionaire':
        return <MillionaireGame {...commonProps} />;
      case 'mystery-box':
        return <MysteryBoxGame {...commonProps} />;
      case 'picture-reveal':
        return <PictureFlipGame {...commonProps} game={game} secretImage={game?.secretImage || game?.bgImageUrl} />;
      case 'crossword':
        return <CrosswordGame {...commonProps} />;
      case 'train':
        return <KnowledgeTrainGame {...commonProps} />;
      case 'flashcard':
        return <FlashcardGame {...commonProps} />;
      case 'fruit-ninja':
        return <FruitNinjaGame {...commonProps} />;
      case 'car-race':
        return <CarRaceGame {...commonProps} />;
      case 'minesweeper':
        return <MinesweeperGame {...commonProps} />;
      case 'flying-words':
        return <FlyingWordsGame {...commonProps} />;
      case 'matching-pairs':
        return <MatchingPairsGame {...commonProps} />;
      case 'duck-race':
        return <DuckRaceGame {...commonProps} />;
      default:
        return <WheelOfFortuneGame {...commonProps} />;
    }
  };

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
        {/* Game Title & School Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '5px 12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0, 168, 150, 0.3)',
            border: '1.5px solid #00a896'
          }}>
            <img 
              src="/assets/skyline_logo.png" 
              alt="Logo Trường SKY-LINE" 
              style={{ height: '28px', objectFit: 'contain' }}
            />
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
              Môn: {game.subject || 'Tổng hợp'} • {questions.length} câu hỏi • <strong style={{ color: '#fbbf24' }}>VỮNG NỘI LỰC - VỮNG TƯƠNG LAI</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowTeamManager(true)}
            style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#c4b5fd' }}
          >
            <Users size={16} />
            ⚙️ Cấu Hình Đội Chơi ({teams.length} đội)
          </button>

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

      {/* ALL TEAMS SCOREBOARD BAR - Displays ALL created teams clearly on main screen */}
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
                  width: '110px'
                }}
              />
              <span style={{ fontWeight: 900, color: '#fff', fontSize: '1.15rem' }}>
                {team.score}đ
              </span>
              
              {/* Quick Score Adjusters */}
              <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAdjustPoints(idx, 50); }}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 900 }}
                  title="Cộng 50 điểm"
                >
                  +50
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAdjustPoints(idx, -50); }}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 900 }}
                  title="Trừ 50 điểm"
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
