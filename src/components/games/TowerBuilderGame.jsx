import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Maximize2, Minimize2, Pause, Play, Flag, 
  RotateCcw, Trophy, Award, Sparkles, AlertTriangle, Shield, Zap, Flame, Crown, CheckCircle2, XCircle
} from 'lucide-react';
import { SoundFX } from '../../utils/sound';

// Top-level SVG Graphics for House Building Blocks
function HouseRoofSVG({ color, teamName, isCurrentTurn }) {
  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isCurrentTurn && (
        <div style={{ 
          position: 'absolute', 
          top: '-36px', 
          zIndex: 10,
          animation: 'bounceTurnArrow 1.2s infinite ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ 
            background: '#ef4444', 
            color: '#fff', 
            fontSize: '0.7rem', 
            fontWeight: 900, 
            padding: '2px 8px', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.6)',
            whiteSpace: 'nowrap',
            marginBottom: '2px'
          }}>
            LƯỢT BẠN
          </div>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '10px solid #ef4444'
          }} />
        </div>
      )}
      <svg viewBox="0 0 200 80" style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}>
        {/* Chimney */}
        <rect x="140" y="15" width="22" height="35" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <rect x="136" y="10" width="30" height="8" rx="2" fill="#92400e" />
        {/* Main Roof Triangle */}
        <polygon points="10,75 100,10 190,75" fill={color || '#dc2626'} stroke="#7f1d1d" strokeWidth="3" />
        {/* Roof Tiles Texture Lines */}
        <path d="M 30 60 Q 100 20 170 60" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeDasharray="6 4" />
        <path d="M 45 48 Q 100 20 155 48" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeDasharray="6 4" />
        {/* Roof Overhang Trim */}
        <polygon points="4,78 100,6 196,78 190,72 100,12 10,72" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        {/* Attic Window */}
        <circle cx="100" cy="45" r="12" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
        <line x1="100" y1="33" x2="100" y2="57" stroke="#ffffff" strokeWidth="2" />
        <line x1="88" y1="45" x2="112" y2="45" stroke="#ffffff" strokeWidth="2" />
      </svg>
    </div>
  );
}

function HouseStoryBlockSVG({ floorNumber, isNew, materialType }) {
  // Determine block style based on material type or standard brick
  const blockBg = materialType === 'wood' ? '#b45309' : (materialType === 'tile' || materialType === 'straw') ? '#ea580c' : '#e2e8f0';
  const strokeColor = materialType === 'wood' ? '#78350f' : (materialType === 'tile' || materialType === 'straw') ? '#9a3412' : '#94a3b8';

  return (
    <div style={{ 
      width: '100%', 
      position: 'relative',
      animation: isNew ? 'dropFloorIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
    }}>
      <svg viewBox="0 0 200 90" style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.2))' }}>
        {/* Main Wall Block */}
        <rect x="15" y="0" width="170" height="90" fill={blockBg} stroke={strokeColor} strokeWidth="3" rx="2" />
        
        {/* Brick Patterns / Wood / Tile Texture */}
        {materialType === 'wood' ? (
          <>
            <line x1="15" y1="20" x2="185" y2="20" stroke="#78350f" strokeWidth="2" />
            <line x1="15" y1="45" x2="185" y2="45" stroke="#78350f" strokeWidth="2" />
            <line x1="15" y1="70" x2="185" y2="70" stroke="#78350f" strokeWidth="2" />
          </>
        ) : (materialType === 'tile' || materialType === 'straw') ? (
          <>
            <path d="M 15 25 Q 35 15 55 25 Q 75 15 95 25 Q 115 15 135 25 Q 155 15 175 25 Q 185 22 185 25" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.65" />
            <path d="M 15 55 Q 35 45 55 55 Q 75 45 95 55 Q 115 45 135 55 Q 155 45 175 55 Q 185 52 185 55" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.65" />
          </>
        ) : (
          <>
            <line x1="15" y1="30" x2="185" y2="30" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="15" y1="60" x2="185" y2="60" stroke="#cbd5e1" strokeWidth="2" />
            {/* Vertical Brick Lines */}
            <line x1="60" y1="0" x2="60" y2="30" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="140" y1="0" x2="140" y2="30" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="100" y1="30" x2="100" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="50" y1="60" x2="50" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="150" y1="60" x2="150" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
          </>
        )}

        {/* Left Window */}
        <rect x="35" y="20" width="40" height="50" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" rx="3" />
        <line x1="55" y1="20" x2="55" y2="70" stroke="#ffffff" strokeWidth="2" />
        <line x1="35" y1="45" x2="75" y2="45" stroke="#ffffff" strokeWidth="2" />
        <rect x="32" y="70" width="46" height="6" fill="#64748b" rx="1" />

        {/* Right Window */}
        <rect x="125" y="20" width="40" height="50" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" rx="3" />
        <line x1="145" y1="20" x2="145" y2="70" stroke="#ffffff" strokeWidth="2" />
        <line x1="125" y1="45" x2="165" y2="45" stroke="#ffffff" strokeWidth="2" />
        <rect x="122" y="70" width="46" height="6" fill="#64748b" rx="1" />

        {/* Floor Label Badge in Center */}
        <rect x="85" y="32" width="30" height="26" fill="#0f172a" rx="6" opacity="0.85" />
        <text x="100" y="50" fill="#fbbf24" fontSize="14" fontWeight="bold" textAnchor="middle">
          T{floorNumber}
        </text>
      </svg>
    </div>
  );
}

function HouseGroundFloorSVG() {
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox="0 0 200 100" style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}>
        {/* Main Wall Block */}
        <rect x="15" y="0" width="170" height="92" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" rx="2" />
        
        {/* Wall Texture Lines */}
        <line x1="15" y1="30" x2="185" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="15" y1="60" x2="185" y2="60" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Left Window */}
        <rect x="32" y="20" width="36" height="42" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" rx="2" />
        <line x1="50" y1="20" x2="50" y2="62" stroke="#ffffff" strokeWidth="2" />
        <line x1="32" y1="41" x2="68" y2="41" stroke="#ffffff" strokeWidth="2" />

        {/* Center Main Door */}
        <rect x="82" y="22" width="36" height="70" fill="#78350f" stroke="#451a03" strokeWidth="3" rx="3" />
        <circle cx="110" cy="58" r="3" fill="#fbbf24" />
        {/* Door Arch Top */}
        <path d="M 82 35 Q 100 15 118 35" fill="none" stroke="#451a03" strokeWidth="2" />

        {/* Right Window */}
        <rect x="132" y="20" width="36" height="42" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" rx="2" />
        <line x1="150" y1="20" x2="150" y2="62" stroke="#ffffff" strokeWidth="2" />
        <line x1="132" y1="41" x2="168" y2="41" stroke="#ffffff" strokeWidth="2" />

        {/* Ground Foundation Base */}
        <rect x="5" y="90" width="190" height="10" fill="#475569" stroke="#1e293b" strokeWidth="2" rx="2" />
      </svg>
    </div>
  );
}

const DEFAULT_QUESTIONS = [
  {
    id: 'tb_q1',
    question: 'Thủ đô của Việt Nam là thành phố nào?',
    options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng'],
    correct: 'A',
    explanation: 'Hà Nội là thủ đô ngàn năm văn hiến và là trung tâm chính trị của Việt Nam.',
    difficulty: 'easy'
  },
  {
    id: 'tb_q2',
    question: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?',
    options: ['Sao Kim', 'Sao Thủy', 'Sao Hỏa', 'Trái Đất'],
    correct: 'B',
    explanation: 'Sao Thủy (Mercury) là hành tinh nằm gần Mặt Trời nhất.',
    difficulty: 'medium'
  },
  {
    id: 'tb_q3',
    question: 'Đỉnh núi nào cao nhất thế giới hiện nay?',
    options: ['K2', 'Fansipan', 'Everest', 'Mont Blanc'],
    correct: 'C',
    explanation: 'Đỉnh Everest thuộc dãy Himalaya cao 8.848m so với mực nước biển.',
    difficulty: 'hard'
  },
  {
    id: 'tb_q4',
    question: 'Chất khí nào chiếm tỉ lệ lớn nhất trong không khí Khí quyển Trái Đất?',
    options: ['Khí Oxy', 'Khí Nitơ', 'Khí Cacbonic', 'Khí Hydro'],
    correct: 'B',
    explanation: 'Khí Nitơ chiếm khoảng 78% thể tích không khí Trái Đất.',
    difficulty: 'easy'
  },
  {
    id: 'tb_q5',
    question: 'Đại dương nào có diện tích lớn nhất hành tinh Trái Đất?',
    options: ['Đại Tây Dương', 'Ấn Độ Dương', 'Bắc Băng Dương', 'Thái Bình Dương'],
    correct: 'D',
    explanation: 'Thái Bình Dương chiếm hơn 30% diện tích bề mặt Trái Đất.',
    difficulty: 'medium'
  },
  {
    id: 'tb_q6',
    question: 'Sông Nilo - con sông dài nhất thế giới nằm ở châu lục nào?',
    options: ['Châu Á', 'Châu Âu', 'Châu Phi', 'Châu Mỹ'],
    correct: 'C',
    explanation: 'Sông Nilo dài hơn 6.650 km chảy qua nhiều quốc gia ở Châu Phi.',
    difficulty: 'hard'
  }
];

const MONSTERS = [
  { id: 'm1', name: 'King Kong', cost: -27, icon: '🦍', desc: 'Làm rung chuyển công trình' },
  { id: 'm2', name: 'Hổ Bão Táp', cost: -20, icon: '🐅', desc: 'Gây bão quật ngã 1 tầng' },
  { id: 'm3', name: 'Gấu Tuyết', cost: -15, icon: '🐻', desc: 'Đóng băng lượt trả lời' },
  { id: 'm4', name: 'Sói Hoang', cost: -10, icon: '🐺', desc: 'Tấn công công trình' },
];

export function TowerBuilderGame({ game, onClose, currentUser }) {
  const questions = (game && game.questions && game.questions.length > 0) 
    ? game.questions 
    : (game && game.defaultQuestions && game.defaultQuestions.length > 0)
    ? game.defaultQuestions
    : DEFAULT_QUESTIONS;

  // Sound and Fullscreen states
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Teams setup (Default 4 teams matching reference picture)
  const [teams, setTeams] = useState([
    { id: 1, name: 'Đội 1', color: '#ef4444', floors: 1, score: 0, floorHistory: ['base'] },
    { id: 2, name: 'Đội 2', color: '#3b82f6', floors: 1, score: 0, floorHistory: ['base'] },
    { id: 3, name: 'Đội 3', color: '#10b981', floors: 1, score: 0, floorHistory: ['base'] },
    { id: 4, name: 'Đội 4', color: '#f59e0b', floors: 1, score: 0, floorHistory: ['base'] },
  ]);

  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Question Modal states
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);

  // Monster / Sabotage Modal state
  const [activeMonster, setActiveMonster] = useState(null);
  const [rewardInfo, setRewardInfo] = useState(null);

  // Animation trigger for newly built floor
  const [newlyBuiltTeamId, setNewlyBuiltTeamId] = useState(null);

  const containerRef = useRef(null);

  // Timer Effect
  useEffect(() => {
    let timer = null;
    if (activeQuestion && !isAnswerSubmitted && !isPaused && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && activeQuestion && !isAnswerSubmitted) {
      handleTimeOut();
    }
    return () => clearInterval(timer);
  }, [activeQuestion, isAnswerSubmitted, isPaused, timerSeconds]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectMaterialCard = (materialType) => {
    if (isGameOver || isPaused) return;
    if (!isMuted) SoundFX.click();

    setSelectedMaterial(materialType);
    const q = questions[questionIdx % questions.length];
    setActiveQuestion(q);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setRewardInfo(null);
    setTimerSeconds(30);
  };

  const handleTimeOut = () => {
    setIsAnswerSubmitted(true);
    setIsCorrect(false);
    setRewardInfo(null);
    if (!isMuted) SoundFX.wrong();
  };

  const handleAnswerSubmit = (optionKey) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(optionKey);
    setIsAnswerSubmitted(true);

    const correctOpt = activeQuestion.correct || activeQuestion.answer;
    const isAnsCorrect = optionKey.toUpperCase() === String(correctOpt).toUpperCase();
    setIsCorrect(isAnsCorrect);

    const activeTeam = teams[currentTurnIdx];

    if (isAnsCorrect) {
      if (!isMuted) SoundFX.correct();

      // Determine random reward: 35% chance to win a Monster Sabotage Card! 65% chance for standard Points!
      const isMonsterReward = Math.random() < 0.35;
      const basePoints = selectedMaterial === 'brick' ? 30 : selectedMaterial === 'wood' ? 20 : 10;

      let currentReward = null;

      if (isMonsterReward) {
        const drawnMonster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
        currentReward = { type: 'monster', monster: drawnMonster, points: basePoints };
      } else {
        currentReward = { type: 'points', points: basePoints };
      }

      setRewardInfo(currentReward);

      // Update team floors & scores
      setTeams((prev) =>
        prev.map((t, idx) => {
          if (idx === currentTurnIdx) {
            const nextFloors = t.floors + 1;
            return {
              ...t,
              floors: nextFloors,
              score: t.score + basePoints,
              floorHistory: [...t.floorHistory, selectedMaterial || 'brick']
            };
          }
          return t;
        })
      );

      setNewlyBuiltTeamId(activeTeam.id);
      setTimeout(() => setNewlyBuiltTeamId(null), 1000);
    } else {
      setRewardInfo(null);
      if (!isMuted) SoundFX.wrong();
    }
  };

  const handleNextTurn = () => {
    setActiveQuestion(null);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setRewardInfo(null);
    setQuestionIdx((prev) => prev + 1);

    // Turn moves to next team
    setCurrentTurnIdx((prev) => (prev + 1) % teams.length);
  };

  const handleMonsterClick = (monster) => {
    if (!isMuted) SoundFX.click();
    setActiveMonster(monster);
  };

  const handleApplyMonsterEffect = (targetTeamId) => {
    if (!activeMonster) return;
    if (!isMuted) SoundFX.wrong();

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === targetTeamId) {
          const newFloors = Math.max(1, t.floors - 1);
          const newScore = Math.max(0, t.score + activeMonster.cost);
          return {
            ...t,
            floors: newFloors,
            score: newScore,
            floorHistory: t.floorHistory.length > 1 ? t.floorHistory.slice(0, -1) : t.floorHistory
          };
        }
        return t;
      })
    );

    setActiveMonster(null);
  };

  const handleFinishGame = () => {
    if (!isMuted) SoundFX.fanfare();
    setIsGameOver(true);
  };

  // Compute Winning Team
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.floors !== a.floors) return b.floors - a.floors;
    return b.score - a.score;
  });
  const winner = sortedTeams[0];

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 40%, #bae6fd 70%, #fef08a 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* 1. TOP HEADER - SCOREBOARD & CONTROLS */}
      <div style={{
        padding: '10px 16px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '2px solid rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 100
      }}>
        {/* Teams Score Cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflowX: 'auto', paddingBottom: '2px' }}>
          {teams.map((team, idx) => {
            const isTurn = idx === currentTurnIdx;
            return (
              <div 
                key={team.id}
                style={{
                  background: isTurn ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.12)',
                  color: isTurn ? '#0f172a' : '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '14px',
                  border: isTurn ? `3px solid ${team.color}` : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: isTurn ? `0 0 20px ${team.color}88` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: '170px',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: team.color,
                  boxShadow: `0 0 8px ${team.color}`
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{team.name}</span>
                    {isTurn && (
                      <span style={{ 
                        background: '#f59e0b', 
                        color: '#0f172a', 
                        fontSize: '0.65rem', 
                        fontWeight: 900, 
                        padding: '1px 6px', 
                        borderRadius: '6px' 
                      }}>
                        ▶ LƯỢT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: isTurn ? 0.9 : 0.75, display: 'flex', gap: '10px', marginTop: '2px' }}>
                    <span>🏢 <b>{team.floors}</b> tầng</span>
                    <span>💎 <b>{team.score}</b> đ</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Header Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              color: '#fff', 
              padding: '8px 12px', 
              borderRadius: '10px', 
              cursor: 'pointer' 
            }}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <button 
            onClick={toggleFullscreen} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              color: '#fff', 
              padding: '8px 12px', 
              borderRadius: '10px', 
              cursor: 'pointer' 
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button 
            onClick={() => setIsPaused(!isPaused)} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              color: '#fff', 
              padding: '8px 14px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </button>

          <button 
            onClick={handleFinishGame} 
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              border: 'none', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(239,68,68,0.4)'
            }}
          >
            Kết thúc
          </button>

          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: '#fff', 
              padding: '8px 12px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              marginLeft: '4px' 
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER BAR - MATERIAL & CHALLENGE SELECTION */}
      <div style={{
        padding: '10px 20px',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        zIndex: 90
      }}>
        {/* Left Side: Monster / Sabotage Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          padding: '6px 12px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            QUÁI PHÁ NHÀ
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {MONSTERS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMonsterClick(m)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#334155',
                  transition: 'all 0.2s ease'
                }}
                title={m.desc}
              >
                <span>{m.icon}</span>
                <span>{m.name}</span>
                <span style={{ color: '#ef4444', fontWeight: 800 }}>{m.cost}đ</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center / Right Side: Question Material Cards (Rơm, Gỗ, Gạch) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Card 1: Ngói (Dễ) */}
          <div 
            onClick={() => handleSelectMaterialCard('tile')}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #ffedd5 100%)',
              border: '2px solid #ea580c',
              borderRadius: '14px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 6px 16px rgba(234, 88, 12, 0.25)',
              transition: 'transform 0.2s ease',
            }}
            className="hover:scale-105"
          >
            <div style={{ fontSize: '1.8rem' }}>🏠</div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#7c2d12' }}>Ngói</div>
              <div style={{ fontSize: '0.72rem', color: '#9a3412' }}>Nhận biết · 2 câu</div>
            </div>
            <div style={{ 
              background: '#ffedd5', 
              color: '#ea580c', 
              fontSize: '0.8rem', 
              fontWeight: 900, 
              padding: '4px 8px', 
              borderRadius: '8px',
              border: '1px solid #fed7aa' 
            }}>
              +10đ
            </div>
          </div>

          {/* Card 2: Gỗ (Vừa) */}
          <div 
            onClick={() => handleSelectMaterialCard('wood')}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #ffedd5 100%)',
              border: '2px solid #ea580c',
              borderRadius: '14px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 6px 16px rgba(234, 88, 12, 0.25)',
              transition: 'transform 0.2s ease',
            }}
            className="hover:scale-105"
          >
            <div style={{ fontSize: '1.8rem' }}>🪵</div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#7c2d12' }}>Gỗ</div>
              <div style={{ fontSize: '0.72rem', color: '#9a3412' }}>Thông hiểu · 3 câu</div>
            </div>
            <div style={{ 
              background: '#ffedd5', 
              color: '#ea580c', 
              fontSize: '0.8rem', 
              fontWeight: 900, 
              padding: '4px 8px', 
              borderRadius: '8px',
              border: '1px solid #fed7aa' 
            }}>
              +20đ
            </div>
          </div>

          {/* Card 3: Gạch (Khó) */}
          <div 
            onClick={() => handleSelectMaterialCard('brick')}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fee2e2 100%)',
              border: '2px solid #dc2626',
              borderRadius: '14px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.25)',
              transition: 'transform 0.2s ease',
            }}
            className="hover:scale-105"
          >
            <div style={{ fontSize: '1.8rem' }}>🧱</div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#7f1d1d' }}>Gạch</div>
              <div style={{ fontSize: '0.72rem', color: '#991b1b' }}>Vận dụng · 1 câu</div>
            </div>
            <div style={{ 
              background: '#fee2e2', 
              color: '#dc2626', 
              fontSize: '0.8rem', 
              fontWeight: 900, 
              padding: '4px 8px', 
              borderRadius: '8px',
              border: '1px solid #fca5a5' 
            }}>
              +30đ
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN ARENA VIEW - SKYLINE & LANDSCAPE */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 30px',
        overflow: 'hidden'
      }}>
        {/* Background Clouds & Sun */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '5%',
          fontSize: '3rem',
          opacity: 0.8,
          animation: 'cloudFloat 25s linear infinite'
        }}>
          ☁️
        </div>
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '12%',
          fontSize: '4rem',
          opacity: 0.85,
          animation: 'cloudFloat 35s linear infinite reverse'
        }}>
          ☁️
        </div>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '5%',
          fontSize: '4rem',
          filter: 'drop-shadow(0 0 30px rgba(253, 224, 71, 0.8))'
        }}>
          ☀️
        </div>

        {/* Rolling Green Hills Horizon */}
        <div style={{
          position: 'absolute',
          bottom: '100px',
          width: '120%',
          height: '140px',
          background: '#86efac',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          zIndex: 1,
          opacity: 0.7
        }} />
        <div style={{
          position: 'absolute',
          bottom: '90px',
          width: '130%',
          height: '160px',
          background: '#4ade80',
          borderRadius: '40% 60% 0 0 / 100% 100% 0 0',
          zIndex: 2,
          opacity: 0.85
        }} />

        {/* Houses Container Grid */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          zIndex: 10,
          paddingBottom: '90px'
        }}>
          {teams.map((team, idx) => {
            const isTurn = idx === currentTurnIdx;
            const isJustBuilt = newlyBuiltTeamId === team.id;

            // Render array of middle floors
            const middleFloors = Array.from({ length: team.floors - 1 }, (_, i) => i + 1);

            return (
              <div 
                key={team.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '180px',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Team Name Label Badge below Roof */}
                <div style={{
                  background: team.color,
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  padding: '3px 12px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  marginBottom: '4px',
                  zIndex: 20
                }}>
                  {team.name} ({team.floors} Tầng)
                </div>

                {/* Roof SVG */}
                <div style={{ width: '100%', zIndex: 15 }}>
                  <HouseRoofSVG color={team.color} teamName={team.name} isCurrentTurn={isTurn} />
                </div>

                {/* Stacked Story Blocks (Reversed so top floors drop in top-down) */}
                <div style={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column-reverse',
                  marginTop: '-8px',
                  zIndex: 10
                }}>
                  {middleFloors.map((floorNum, fIdx) => (
                    <HouseStoryBlockSVG 
                      key={fIdx} 
                      floorNumber={floorNum + 1}
                      isNew={isJustBuilt && fIdx === middleFloors.length - 1}
                      materialType={team.floorHistory[fIdx + 1] || 'brick'}
                    />
                  ))}
                </div>

                {/* Ground Floor Base SVG */}
                <div style={{ width: '100%', marginTop: '-8px', zIndex: 5 }}>
                  <HouseGroundFloorSVG />
                </div>
              </div>
            );
          })}
        </div>

        {/* Brown Dirt & Grass Ground Floor Strip */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(180deg, #854d0e 0%, #543310 100%)',
          borderTop: '8px solid #65a30d',
          zIndex: 5,
          boxShadow: '0 -10px 25px rgba(0,0,0,0.2)'
        }} />
      </div>

      {/* 4. QUESTION POPUP MODAL */}
      {activeQuestion && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '4px solid #f59e0b',
            animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative'
          }}>
            {/* Question Header Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  background: teams[currentTurnIdx].color,
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>
                  LƯỢT CỦA: {teams[currentTurnIdx].name}
                </span>
                <span style={{
                  background: selectedMaterial === 'brick' ? '#fee2e2' : selectedMaterial === 'wood' ? '#ffedd5' : '#fef3c7',
                  color: selectedMaterial === 'brick' ? '#dc2626' : selectedMaterial === 'wood' ? '#ea580c' : '#d97706',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                  borderRadius: '10px'
                }}>
                  {selectedMaterial === 'brick' ? '🧱 Gạch (Khó +30đ)' : selectedMaterial === 'wood' ? '🪵 Gỗ (Vừa +20đ)' : '🏠 Ngói (Dễ +10đ)'}
                </span>
              </div>

              {/* Countdown Timer Circle */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: timerSeconds <= 5 ? '#fee2e2' : '#f1f5f9',
                color: timerSeconds <= 5 ? '#dc2626' : '#0f172a',
                border: `3px solid ${timerSeconds <= 5 ? '#ef4444' : '#cbd5e1'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem'
              }}>
                {timerSeconds}
              </div>
            </div>

            {/* Question Content */}
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.4,
              marginBottom: '24px'
            }}>
              {activeQuestion.question}
            </h3>

            {/* Question Image if present */}
            {activeQuestion.imageUrl && (
              <img 
                src={activeQuestion.imageUrl} 
                alt="Question illustration"
                style={{
                  maxHeight: '180px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  marginBottom: '20px',
                  display: 'block',
                  margin: '0 auto 20px auto'
                }} 
              />
            )}

            {/* 4 Answer Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              {activeQuestion.options.map((opt, idx) => {
                const optionKey = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedAnswer === optionKey;
                const correctOpt = activeQuestion.correct || activeQuestion.answer;
                const isThisCorrect = optionKey.toUpperCase() === String(correctOpt).toUpperCase();

                let btnBg = '#f8fafc';
                let btnBorder = '#cbd5e1';
                let btnColor = '#1e293b';

                if (isAnswerSubmitted) {
                  if (isThisCorrect) {
                    btnBg = '#dcfce7';
                    btnBorder = '#22c55e';
                    btnColor = '#15803d';
                  } else if (isSelected) {
                    btnBg = '#fee2e2';
                    btnBorder = '#ef4444';
                    btnColor = '#b91c1c';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSubmit(optionKey)}
                    disabled={isAnswerSubmitted}
                    style={{
                      background: btnBg,
                      border: `2px solid ${btnBorder}`,
                      color: btnColor,
                      padding: '14px 18px',
                      borderRadius: '16px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: isAnswerSubmitted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isAnswerSubmitted && isThisCorrect ? '#22c55e' : '#e2e8f0',
                      color: isAnswerSubmitted && isThisCorrect ? '#fff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.85rem'
                    }}>
                      {optionKey}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Result Banner & Next Button */}
            {isAnswerSubmitted && (
              <div style={{
                background: isCorrect ? (rewardInfo?.type === 'monster' ? '#fefce8' : '#f0fdf4') : '#fef2f2',
                border: `2px solid ${isCorrect ? (rewardInfo?.type === 'monster' ? '#eab308' : '#4ade80') : '#f87171'}`,
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    color: isCorrect ? (rewardInfo?.type === 'monster' ? '#854d0e' : '#166534') : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {isCorrect ? <CheckCircle2 color={rewardInfo?.type === 'monster' ? '#ca8a04' : '#22c55e'} size={24} /> : <XCircle color="#ef4444" size={24} />}
                    {isCorrect ? (
                      rewardInfo?.type === 'monster' ? (
                        <span>
                          🎉 CHÍNH XÁC! XÂY +1 TẦNG & 🎁 THẺ THƯỞNG: <b>{rewardInfo.monster.icon} {rewardInfo.monster.name}</b> (+{rewardInfo.points}đ)!
                        </span>
                      ) : (
                        <span>
                          🎉 CHÍNH XÁC! XÂY THÊM +1 TẦNG NHÀ & +{rewardInfo?.points || 10} ĐIỂM!
                        </span>
                      )
                    ) : (
                      'RẤT TIẾC, ĐÁP ÁN CHƯA ĐÚNG! 😅'
                    )}
                  </div>
                  {activeQuestion.explanation && (
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                      💡 {activeQuestion.explanation}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isCorrect && rewardInfo?.type === 'monster' && (
                    <button
                      onClick={() => {
                        setActiveMonster(rewardInfo.monster);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 18px',
                        borderRadius: '14px',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(239,68,68,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      💣 Đi Phá Nhà Đội Bạn!
                    </button>
                  )}

                  <button
                    onClick={handleNextTurn}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Lượt tiếp theo ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MONSTER / SABOTAGE EVENT MODAL */}
      {activeMonster && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{activeMonster.icon}</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              Sức Mạnh {activeMonster.name}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '8px 0 20px 0' }}>
              Chọn nhà của đội cần nhắm tới để giảm {Math.abs(activeMonster.cost)} điểm & thổi bay 1 tầng:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleApplyMonsterEffect(t.id)}
                  style={{
                    background: t.color,
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {t.name} ({t.floors} Tầng)
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveMonster(null)}
              style={{ background: '#e2e8f0', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 700 }}
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* 6. VICTORY / GAME OVER CELEBRATION SCREEN */}
      {isGameOver && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          color: '#fff'
        }}>
          <div style={{ fontSize: '4rem', animation: 'bounceTurnArrow 1s infinite' }}>👑</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.6)', marginBottom: '8px' }}>
            NHÀ VÔ ĐỊCH XÂY THÁP TRI THỨC
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '32px' }}>
            Chúc mừng <b>{winner.name}</b> đã xây dựng tòa tháp cao nhất với <b>{winner.floors} Tầng</b> và đạt <b>{winner.score} Điểm</b>!
          </p>

          {/* Podium Standings */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '40px' }}>
            {sortedTeams.map((t, rank) => (
              <div 
                key={t.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '130px'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: t.color, marginBottom: '6px' }}>
                  {t.name}
                </div>
                <div style={{
                  background: rank === 0 ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.15)',
                  width: '100%',
                  height: rank === 0 ? '160px' : rank === 1 ? '120px' : '90px',
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  boxShadow: rank === 0 ? '0 0 30px rgba(245, 158, 11, 0.5)' : 'none'
                }}>
                  <span style={{ fontSize: '1.6rem', color: '#fff' }}>#{rank + 1}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{t.floors} Tầng</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{t.score} điểm</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => {
                setTeams([
                  { id: 1, name: 'Đội 1', color: '#ef4444', floors: 1, score: 0, floorHistory: ['base'] },
                  { id: 2, name: 'Đội 2', color: '#3b82f6', floors: 1, score: 0, floorHistory: ['base'] },
                  { id: 3, name: 'Đội 3', color: '#10b981', floors: 1, score: 0, floorHistory: ['base'] },
                  { id: 4, name: 'Đội 4', color: '#f59e0b', floors: 1, score: 0, floorHistory: ['base'] },
                ]);
                setCurrentTurnIdx(0);
                setQuestionIdx(0);
                setIsGameOver(false);
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RotateCcw size={18} /> Chơi Lại Trận Mới
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '14px 28px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Thoát Ra Màn Hình Chính
            </button>
          </div>
        </div>
      )}

      {/* Global CSS Keyframe Animations */}
      <style>{`
        @keyframes dropFloorIn {
          0% { transform: translateY(-120px) scale(1.1); opacity: 0; }
          70% { transform: translateY(10px) scale(0.98); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes bounceTurnArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cloudFloat {
          0% { transform: translateX(0); }
          100% { transform: translateX(100vw); }
        }
        @keyframes modalPop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
