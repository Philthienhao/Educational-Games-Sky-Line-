import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Maximize2, Minimize2, Pause, Play, Flag, 
  RotateCcw, Trophy, Award, Sparkles, CheckCircle2, XCircle, Shield, Zap,
  Edit3, Check
} from 'lucide-react';
import { SoundFX } from '../../utils/sound';

// Top-Level HD Crisp Vector Mario Runner SVG Component
function MarioSpriteSVG({ color, isJumping, isRunning, isStunned }) {
  const capColor = color || '#ef4444';
  const overallColor = color || '#ef4444';
  const shirtColor = 
    color === '#ef4444' ? '#2563eb' : 
    color === '#3b82f6' ? '#ef4444' : 
    color === '#10b981' ? '#f59e0b' : 
    '#dc2626';

  return (
    <div style={{
      width: '58px',
      height: '68px',
      position: 'relative',
      transform: isStunned ? 'rotate(90deg) translateY(12px)' : isJumping ? 'translateY(-24px) scale(1.08)' : 'none',
      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))'
    }}>
      <svg viewBox="0 0 80 96" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Mario Cap Crown */}
        <path d="M 18 30 C 18 12, 62 12, 62 30 Z" fill={capColor} stroke="#0f172a" strokeWidth="2.5" />
        {/* Cap Visor / Brim */}
        <path d="M 10 28 C 30 22, 70 22, 78 30 C 74 36, 32 34, 10 28 Z" fill={capColor} stroke="#0f172a" strokeWidth="2" />

        {/* Emblem Badge on Cap */}
        <circle cx="40" cy="20" r="7.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <text x="40" y="24" fill={capColor} fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">M</text>

        {/* Hair (Back & Sideburns) */}
        <path d="M 16 30 C 8 36, 10 50, 20 48 Z" fill="#451a03" stroke="#0f172a" strokeWidth="2" />

        {/* Face (Peach Skin) */}
        <path d="M 20 30 C 20 50, 60 50, 60 30 Z" fill="#fde047" stroke="#0f172a" strokeWidth="2.5" />
        <path d="M 23 32 C 23 48, 57 48, 57 32 Z" fill="#fecdd3" />

        {/* Eye */}
        <ellipse cx="48" cy="34" rx="3.5" ry="5.5" fill="#0f172a" />
        <circle cx="49" cy="32" r="1.2" fill="#ffffff" />

        {/* Mario Nose */}
        <ellipse cx="55" cy="39" rx="7.5" ry="6" fill="#fecdd3" stroke="#0f172a" strokeWidth="2" />

        {/* Mario Mustache */}
        <path d="M 34 43 C 40 38, 62 38, 70 44 C 66 49, 42 49, 34 43 Z" fill="#18181b" stroke="#000000" strokeWidth="2" />

        {/* Shirt Body & Arms */}
        <path d="M 18 52 C 18 46, 62 46, 62 52 L 60 68 L 20 68 Z" fill={shirtColor} stroke="#0f172a" strokeWidth="2" />

        {/* Overalls Straps */}
        <path d="M 24 52 L 32 52 L 32 72 L 24 72 Z" fill={overallColor} stroke="#0f172a" strokeWidth="1.5" />
        <path d="M 48 52 L 56 52 L 56 72 L 48 72 Z" fill={overallColor} stroke="#0f172a" strokeWidth="1.5" />
        {/* Overalls Pants */}
        <path d="M 20 62 C 20 56, 60 56, 60 62 L 62 82 C 62 86, 18 86, 18 82 Z" fill={overallColor} stroke="#0f172a" strokeWidth="2" />

        {/* Yellow Overalls Buttons */}
        <circle cx="28" cy="62" r="3" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
        <circle cx="52" cy="62" r="3" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />

        {/* White Gloved Hands */}
        <circle cx="14" cy="58" r="5.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="66" cy="58" r="5.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />

        {/* Brown Boots */}
        <path d="M 16 80 C 10 80, 8 94, 30 94 C 34 94, 34 84, 30 80 Z" fill="#78350f" stroke="#0f172a" strokeWidth="2" />
        <path d="M 50 80 C 44 80, 44 94, 66 94 C 72 94, 70 80, 64 80 Z" fill="#78350f" stroke="#0f172a" strokeWidth="2" />
      </svg>
    </div>
  );
}

// Question Mark (?) Block SVG
function QuestionBlockSVG({ isHit }) {
  return (
    <div style={{
      width: '38px',
      height: '38px',
      transform: isHit ? 'translateY(-10px) scale(0.92)' : 'none',
      transition: 'transform 0.2s ease',
      filter: isHit ? 'brightness(0.6)' : 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.45))'
    }}>
      <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Outer Frame */}
        <rect x="1" y="1" width="38" height="38" fill={isHit ? '#78350f' : '#d97706'} stroke="#451a03" strokeWidth="2.5" rx="5" />
        <rect x="3" y="3" width="34" height="34" fill={isHit ? '#92400e' : '#fbbf24'} rx="4" />
        <rect x="5" y="5" width="30" height="30" fill={isHit ? '#78350f' : '#f59e0b'} rx="3" />

        {/* Corner Bolts */}
        <circle cx="7" cy="7" r="1.8" fill="#451a03" />
        <circle cx="33" cy="7" r="1.8" fill="#451a03" />
        <circle cx="7" cy="33" r="1.8" fill="#451a03" />
        <circle cx="33" cy="33" r="1.8" fill="#451a03" />

        {/* Center Question Mark (?) */}
        {!isHit && (
          <text x="20" y="28" fill="#ffffff" stroke="#78350f" strokeWidth="1.5" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            ?
          </text>
        )}
      </svg>
    </div>
  );
}

// HD Warp Pipe SVG
function WarpPipeSVG() {
  return (
    <div style={{ width: '44px', height: '54px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' }}>
      <svg viewBox="0 0 44 54" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Dark Inner Hole Shadow */}
        <ellipse cx="22" cy="6" rx="18" ry="4" fill="#064e3b" />
        
        {/* Pipe Top Rim */}
        <rect x="2" y="4" width="40" height="16" fill="#16a34a" stroke="#064e3b" strokeWidth="2.5" rx="3" />
        <rect x="5" y="6" width="6" height="12" fill="#4ade80" rx="1" />
        <rect x="13" y="6" width="4" height="12" fill="#22c55e" />

        {/* Pipe Main Body */}
        <rect x="6" y="20" width="32" height="34" fill="#15803d" stroke="#064e3b" strokeWidth="2.5" />
        <rect x="9" y="20" width="5" height="34" fill="#4ade80" />
        <rect x="16" y="20" width="3" height="34" fill="#22c55e" />
      </svg>
    </div>
  );
}

// HD Brick Block SVG
function BrickBlockSVG() {
  return (
    <div style={{ width: '36px', height: '36px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}>
      <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect x="1" y="1" width="38" height="38" fill="#9a3412" stroke="#451a03" strokeWidth="2.5" rx="3" />
        <rect x="3" y="3" width="34" height="34" fill="#c05621" rx="2" />
        
        {/* Mortar Brick Lines */}
        <line x1="1" y1="13" x2="39" y2="13" stroke="#451a03" strokeWidth="2.5" />
        <line x1="1" y1="26" x2="39" y2="26" stroke="#451a03" strokeWidth="2.5" />
        
        <line x1="20" y1="1" x2="20" y2="13" stroke="#451a03" strokeWidth="2.5" />
        <line x1="10" y1="13" x2="10" y2="26" stroke="#451a03" strokeWidth="2.5" />
        <line x1="30" y1="13" x2="30" y2="26" stroke="#451a03" strokeWidth="2.5" />
        <line x1="20" y1="26" x2="20" y2="39" stroke="#451a03" strokeWidth="2.5" />

        {/* Highlights */}
        <line x1="3" y1="3" x2="37" y2="3" stroke="#ea580c" strokeWidth="1.5" />
        <line x1="3" y1="3" x2="3" y2="37" stroke="#ea580c" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// HD Goomba Enemy SVG (Quái Nấm Goomba)
function GoombaEnemySVG({ isSquished }) {
  return (
    <div style={{
      width: '38px',
      height: '38px',
      transform: isSquished ? 'scaleY(0.25) translateY(28px)' : 'none',
      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))'
    }}>
      <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Goomba Mushroom Cap (Head) */}
        <path d="M 32 4 C 12 4, 4 22, 6 36 C 20 42, 44 42, 58 36 C 60 22, 52 4, 32 4 Z" fill="#78350f" stroke="#0f172a" strokeWidth="2.5" />
        <path d="M 32 8 C 16 8, 8 22, 10 33 C 22 37, 42 37, 54 33 C 56 22, 48 8, 32 8 Z" fill="#9a3412" />

        {/* Stem Body */}
        <path d="M 20 34 C 20 50, 44 50, 44 34 Z" fill="#fde047" stroke="#0f172a" strokeWidth="2" />

        {/* Angry Eyebrows */}
        <path d="M 14 22 L 28 27 L 27 29 L 13 25 Z" fill="#000000" />
        <path d="M 50 22 L 36 27 L 37 29 L 51 25 Z" fill="#000000" />

        {/* Oval Eyes */}
        <ellipse cx="22" cy="30" rx="4" ry="6.5" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
        <ellipse cx="42" cy="30" rx="4" ry="6.5" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
        <ellipse cx="23.5" cy="30" rx="2" ry="3.8" fill="#000000" />
        <ellipse cx="40.5" cy="30" rx="2" ry="3.8" fill="#000000" />

        {/* Sharp White Fangs */}
        <polygon points="20,36 24,36 22,32" fill="#ffffff" stroke="#000000" strokeWidth="1" />
        <polygon points="40,36 44,36 42,32" fill="#ffffff" stroke="#000000" strokeWidth="1" />

        {/* Black Feet */}
        <path d="M 10 48 C 10 42, 28 42, 28 52 C 28 56, 10 56, 10 48 Z" fill="#18181b" stroke="#000000" strokeWidth="2" />
        <path d="M 54 48 C 54 42, 36 42, 36 52 C 36 56, 54 56, 54 48 Z" fill="#18181b" stroke="#000000" strokeWidth="2" />
      </svg>
    </div>
  );
}

// 8-bit Staircase Pyramid SVG (Bậc Thang Gạch 8-bit)
function StaircaseBlockSVG() {
  return (
    <div style={{ width: '64px', height: '56px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>
      <svg viewBox="0 0 64 56" style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}>
        {/* Step 3 (Top) */}
        <rect x="42" y="2" width="20" height="18" fill="#c05621" stroke="#451a03" strokeWidth="2" rx="1" />
        <rect x="44" y="4" width="16" height="14" fill="#ea580c" />
        {/* Step 2 (Middle) */}
        <rect x="22" y="20" width="40" height="18" fill="#c05621" stroke="#451a03" strokeWidth="2" rx="1" />
        <rect x="24" y="22" width="36" height="14" fill="#ea580c" />
        {/* Step 1 (Bottom) */}
        <rect x="2" y="38" width="60" height="18" fill="#c05621" stroke="#451a03" strokeWidth="2" rx="1" />
        <rect x="4" y="40" width="56" height="14" fill="#ea580c" />
      </svg>
    </div>
  );
}

// 8-bit Bush Green SVG (Bụi Cỏ Xanh)
function BushGreenSVG() {
  return (
    <div style={{ width: '48px', height: '26px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
      <svg viewBox="0 0 52 28" style={{ width: '100%', height: '100%', display: 'block' }}>
        <path d="M 6 28 A 12 12 0 0 1 20 10 A 14 14 0 0 1 36 10 A 10 10 0 0 1 48 28 Z" fill="#16a34a" stroke="#14532d" strokeWidth="2" />
        <path d="M 8 28 A 10 10 0 0 1 20 12 A 12 12 0 0 1 34 12 A 8 8 0 0 1 46 28 Z" fill="#22c55e" />
        <circle cx="20" cy="15" r="4" fill="#4ade80" />
        <circle cx="30" cy="15" r="4" fill="#4ade80" />
      </svg>
    </div>
  );
}

const DEFAULT_QUESTIONS = [
  {
    id: 'mario_q1',
    question: 'Châu lục nào có diện tích lớn nhất trên Trái Đất?',
    options: ['Châu Á', 'Châu Phi', 'Châu Mỹ', 'Châu Âu'],
    correct: 'A',
    explanation: 'Châu Á là châu lục lớn nhất về cả diện tích và dân số.',
    difficulty: 'easy'
  },
  {
    id: 'mario_q2',
    question: 'Nguyên tố hóa học nào có ký hiệu là O?',
    options: ['Vàng', 'Oxy', 'Sắt', 'Đồng'],
    correct: 'B',
    explanation: 'O là ký hiệu của nguyên tố Khí Oxy.',
    difficulty: 'easy'
  },
  {
    id: 'mario_q3',
    question: 'Trái Đất quay xung quanh Mặt Trời mất khoảng thời gian bao lâu?',
    options: ['24 giờ', '30 ngày', '365 ngày (1 năm)', '10 năm'],
    correct: 'C',
    explanation: 'Trái Đất hoàn thành một vòng quỹ đạo quanh Mặt Trời mất khoảng 365,25 ngày.',
    difficulty: 'medium'
  },
  {
    id: 'mario_q4',
    question: 'Sông Cửu Long chảy qua lãnh thổ Việt Nam và đổ ra biển gì?',
    options: ['Biển Đỏ', 'Biển Đông', 'Biển Đen', 'Thái Bình Dương'],
    correct: 'B',
    explanation: 'Đồng bằng sông Cửu Long đổ ra Biển Đông qua 9 cửa sông.',
    difficulty: 'medium'
  },
  {
    id: 'mario_q5',
    question: 'Dãy núi nào được coi là bức tường thành tự nhiên cao nhất thế giới?',
    options: ['Dãy Trường Sơn', 'Dãy Himalaya', 'Dãy An-đét', 'Dãy An-pơ'],
    correct: 'B',
    explanation: 'Dãy Himalaya sở hữu đỉnh Everest cao nhất thế giới (8.848m).',
    difficulty: 'hard'
  }
];

const POWER_ITEMS = [
  { id: 'mushroom', name: 'Nấm Siêu Tăng Tốc', icon: '🍄', desc: 'Vọt tiến nhanh +2 bước!' },
  { id: 'star', name: 'Ngôi Sao Vô Địch', icon: '⭐️', desc: 'Tiến +1 bước & Nhân đôi điểm thưởng!' },
  { id: 'shell', name: 'Mai Rùa Đỏ', icon: '🐢', desc: 'Chặn 1 Mario đối thủ đứng lại 1 lượt!' },
  { id: 'coin', name: 'Đồng Xu Tri Thức', icon: '💰', desc: 'Tiến +1 bước & Thưởng 20 điểm!' },
];

export function MarioRaceGame({ game, onClose, currentUser }) {
  const questions = (game && game.questions && game.questions.length > 0) 
    ? game.questions 
    : (game && game.defaultQuestions && game.defaultQuestions.length > 0)
    ? game.defaultQuestions
    : DEFAULT_QUESTIONS;

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Teams setup: 4 Mario teams with different colors
  const [teams, setTeams] = useState([
    { id: 1, name: 'Mario Đỏ', color: '#ef4444', step: 0, score: 0, isStunned: false },
    { id: 2, name: 'Mario Xanh Dương', color: '#3b82f6', step: 0, score: 0, isStunned: false },
    { id: 3, name: 'Mario Xanh Lá', color: '#10b981', step: 0, score: 0, isStunned: false },
    { id: 4, name: 'Mario Vàng', color: '#f59e0b', step: 0, score: 0, isStunned: false },
  ]);

  // Editable team names state
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  const handleStartEditTeam = (team, e) => {
    if (e) e.stopPropagation();
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  const handleSaveTeamName = (teamId) => {
    const trimmed = editingTeamName.trim();
    if (trimmed) {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, name: trimmed } : t))
      );
    }
    setEditingTeamId(null);
  };

  const TOTAL_STEPS = 10; // Total track length to reach Castle
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);

  // Modal & Answer states
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);

  // Reward info state
  const [rewardItem, setRewardItem] = useState(null);
  const [isSabotageModalOpen, setIsSabotageModalOpen] = useState(false);

  // Animation states
  const [activeJumpingTeamId, setActiveJumpingTeamId] = useState(null);

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

  const handleOpenQuestion = () => {
    if (isGameOver || isPaused) return;
    if (!isMuted) SoundFX.click();

    // Check if current team is stunned
    const currentTeam = teams[currentTurnIdx];
    if (currentTeam.isStunned) {
      // Unstun team and skip turn
      setTeams((prev) =>
        prev.map((t, idx) => (idx === currentTurnIdx ? { ...t, isStunned: false } : t))
      );
      handleNextTurn();
      return;
    }

    const q = questions[questionIdx % questions.length];
    setActiveQuestion(q);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setRewardItem(null);
    setTimerSeconds(30);
  };

  const handleTimeOut = () => {
    setIsAnswerSubmitted(true);
    setIsCorrect(false);
    setRewardItem(null);
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

      // Trigger Mario jump animation
      setActiveJumpingTeamId(activeTeam.id);
      setTimeout(() => setActiveJumpingTeamId(null), 800);

      // Randomly roll item reward (40% chance for special Power-up, 60% chance for standard Coin step)
      const isPowerUp = Math.random() < 0.4;
      let drawnItem = null;
      let stepsToAdvance = 1;
      let bonusScore = 15;

      if (isPowerUp) {
        drawnItem = POWER_ITEMS[Math.floor(Math.random() * POWER_ITEMS.length)];
        if (drawnItem.id === 'mushroom') {
          stepsToAdvance = 2;
          bonusScore = 25;
        } else if (drawnItem.id === 'star') {
          stepsToAdvance = 1;
          bonusScore = 30;
        } else if (drawnItem.id === 'coin') {
          stepsToAdvance = 1;
          bonusScore = 20;
        }
      }

      setRewardItem(drawnItem);

      // Advance team step & score
      setTeams((prev) =>
        prev.map((t, idx) => {
          if (idx === currentTurnIdx) {
            const nextStep = Math.min(TOTAL_STEPS, t.step + stepsToAdvance);
            return {
              ...t,
              step: nextStep,
              score: t.score + bonusScore
            };
          }
          return t;
        })
      );

      // Check win condition
      if (activeTeam.step + stepsToAdvance >= TOTAL_STEPS) {
        setTimeout(() => {
          if (!isMuted) SoundFX.fanfare();
          setIsGameOver(true);
        }, 1000);
      }
    } else {
      setRewardItem(null);
      if (!isMuted) SoundFX.wrong();

      // Penalty for wrong answer: lùi 1 ô hoặc đứng nguyên
      setTeams((prev) =>
        prev.map((t, idx) => {
          if (idx === currentTurnIdx) {
            const newStep = Math.max(0, t.step - 1);
            return { ...t, step: newStep };
          }
          return t;
        })
      );
    }
  };

  const handleApplyShellSabotage = (targetTeamId) => {
    if (!isMuted) SoundFX.wrong();
    setTeams((prev) =>
      prev.map((t) => (t.id === targetTeamId ? { ...t, isStunned: true } : t))
    );
    setIsSabotageModalOpen(false);
  };

  const handleNextTurn = () => {
    setActiveQuestion(null);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setRewardItem(null);
    setQuestionIdx((prev) => prev + 1);

    // Pass turn to next team
    setCurrentTurnIdx((prev) => (prev + 1) % teams.length);
  };

  // Sort teams by progress step and score for standings
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.step !== a.step) return b.step - a.step;
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
        background: 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 45%, #bae6fd 75%, #fef08a 100%)',
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
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '2px solid rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 100
      }}>
        {/* Team Score Cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflowX: 'auto', paddingBottom: '2px' }}>
          {teams.map((team, idx) => {
            const isTurn = idx === currentTurnIdx;
            const progressPercent = Math.round((team.step / TOTAL_STEPS) * 100);

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
                  minWidth: '185px',
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
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    {editingTeamId === team.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTeamName}
                          onChange={(e) => setEditingTeamName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTeamName(team.id);
                            if (e.key === 'Escape') setEditingTeamId(null);
                          }}
                          onBlur={() => handleSaveTeamName(team.id)}
                          autoFocus
                          maxLength={24}
                          style={{
                            background: isTurn ? '#f1f5f9' : 'rgba(15, 23, 42, 0.85)',
                            color: isTurn ? '#0f172a' : '#ffffff',
                            border: `2px solid ${team.color}`,
                            borderRadius: '6px',
                            padding: '2px 6px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            width: '115px',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveTeamName(team.id); }}
                          style={{
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Lưu tên mới"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', flex: 1 }}
                        onClick={(e) => handleStartEditTeam(team, e)}
                        title="Click để đổi tên đội"
                      >
                        <span style={{ borderBottom: '1px dashed transparent', transition: 'border-color 0.2s' }}>{team.name}</span>
                        <Edit3 size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
                      </div>
                    )}

                    {isTurn && (
                      <span style={{ 
                        background: '#f59e0b', 
                        color: '#0f172a', 
                        fontSize: '0.65rem', 
                        fontWeight: 900, 
                        padding: '1px 6px', 
                        borderRadius: '6px',
                        flexShrink: 0
                      }}>
                        ▶ LƯỢT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: isTurn ? 0.9 : 0.75, display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>🏁 <b>{team.step}/{TOTAL_STEPS}</b> ô</span>
                    <span>💎 <b>{team.score}</b> đ</span>
                    {team.isStunned && <span style={{ color: '#ef4444', fontWeight: 900 }}>🛑 Dừng</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
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
            onClick={() => setIsGameOver(true)} 
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

      {/* 2. SUB-HEADER BAR - POWER-UP ITEMS SHOWCASE & ACTION */}
      <div style={{
        padding: '8px 20px',
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        zIndex: 90
      }}>
        {/* Power-up Showcase */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          padding: '6px 14px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
            VẬT PHẨM MARIO
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {POWER_ITEMS.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#334155'
                }}
                title={item.desc}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Turn Trigger Action Button */}
        <button
          onClick={handleOpenQuestion}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '14px',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'pulseTurnBtn 1.5s infinite'
          }}
        >
          <span>❓ TRẢ LỜI CÂU HỎI MARIO ({teams[currentTurnIdx].name})</span>
        </button>
      </div>

      {/* 3. RETRO MARIO TRACK ARENA */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '20px 40px 60px 40px',
        overflow: 'hidden'
      }}>
        {/* Background Clouds & Hills */}
        <div style={{ position: 'absolute', top: '15px', left: '8%', fontSize: '2.8rem', opacity: 0.8, animation: 'cloudFloat 30s linear infinite' }}>☁️</div>
        <div style={{ position: 'absolute', top: '40px', right: '15%', fontSize: '3.5rem', opacity: 0.85, animation: 'cloudFloat 40s linear infinite reverse' }}>☁️</div>

        {/* Running Track Lanes */}
        {teams.map((team, idx) => {
          const isTurn = idx === currentTurnIdx;
          const isJumping = activeJumpingTeamId === team.id;
          const leftPercent = Math.min(85, (team.step / TOTAL_STEPS) * 82);

          return (
            <div 
              key={team.id}
              style={{
                position: 'relative',
                height: '92px',
                background: isTurn ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.18)',
                borderRadius: '16px',
                border: isTurn ? `2.5px solid ${team.color}` : '1px stroke rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                boxShadow: isTurn ? `0 0 20px ${team.color}77` : '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}
            >
              {/* Lane Start Flag */}
              <div 
                onClick={(e) => handleStartEditTeam(team, e)}
                style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '10px',
                  fontSize: '0.88rem', 
                  fontWeight: 900, 
                  color: team.color,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  zIndex: 25,
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
                title="Click để đổi tên đội"
              >
                <span>{team.name}</span>
                <Edit3 size={11} style={{ opacity: 0.8 }} />
              </div>

              {/* 1. Ground Bushes */}
              <div style={{ position: 'absolute', left: '135px', bottom: '12px', zIndex: 2 }}>
                <BushGreenSVG />
              </div>
              <div style={{ position: 'absolute', left: '580px', bottom: '12px', zIndex: 2 }}>
                <BushGreenSVG />
              </div>

              {/* 2. Goomba Enemies (Quái nấm) */}
              <div style={{ position: 'absolute', left: '210px', bottom: '12px', zIndex: 3 }}>
                <GoombaEnemySVG isSquished={team.step >= 2} />
              </div>
              <div style={{ position: 'absolute', left: '460px', bottom: '12px', zIndex: 3 }}>
                <GoombaEnemySVG isSquished={team.step >= 5} />
              </div>

              {/* 3. Floating Brick & Question Block Clusters ([Brick] [?] [Brick]) */}
              <div style={{ position: 'absolute', left: '260px', top: '10px', display: 'flex', gap: '2px', zIndex: 5 }}>
                <BrickBlockSVG />
                <QuestionBlockSVG isHit={team.step >= 3} />
                <BrickBlockSVG />
              </div>

              <div style={{ position: 'absolute', left: '510px', top: '10px', display: 'flex', gap: '2px', zIndex: 5 }}>
                <BrickBlockSVG />
                <QuestionBlockSVG isHit={team.step >= 6} />
                <BrickBlockSVG />
              </div>

              <div style={{ position: 'absolute', left: '720px', top: '10px', display: 'flex', gap: '2px', zIndex: 5 }}>
                <QuestionBlockSVG isHit={team.step >= 9} />
                <BrickBlockSVG />
              </div>

              {/* 4. Warp Pipes (Ống nước / Ống khói xanh 8-bit) */}
              <div style={{ position: 'absolute', left: '380px', bottom: '12px', zIndex: 4 }}>
                <WarpPipeSVG />
              </div>
              <div style={{ position: 'absolute', left: '640px', bottom: '12px', zIndex: 4 }}>
                <WarpPipeSVG />
              </div>

              {/* 5. Staircase Pyramid (Bậc thang gạch 8-bit) */}
              <div style={{ position: 'absolute', right: '115px', bottom: '12px', zIndex: 5 }}>
                <StaircaseBlockSVG />
              </div>

              {/* 6. Mario Sprite Runner Container */}
              <div style={{
                position: 'absolute',
                left: `calc(120px + ${leftPercent}%)`,
                bottom: '14px',
                transition: 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 20
              }}>
                <MarioSpriteSVG 
                  color={team.color} 
                  isJumping={isJumping} 
                  isStunned={team.isStunned}
                />
              </div>

              {/* 7. Finish Castle & Flagpole */}
              <div style={{ position: 'absolute', right: '10px', bottom: '0px', zIndex: 10 }}>
                <FinishCastleSVG />
              </div>

              {/* 8. Retro Brick Ground Strip along bottom of lane */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '14px',
                background: '#c05621',
                borderTop: '2px solid #78350f',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                backgroundImage: 'repeating-linear-gradient(90deg, #78350f 0 2px, transparent 2px 16px)'
              }} />
            </div>
          );
        })}

        {/* Retro Brick Ground Strip at Bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50px',
          background: '#b45309',
          borderTop: '6px solid #78350f',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.3)',
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.15) 50%, transparent 50%)',
          backgroundSize: '20px 20px'
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
            {/* Question Header */}
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
                  LƯỢT ĐUA: {teams[currentTurnIdx].name}
                </span>
                <span style={{
                  background: '#fef3c7',
                  color: '#d97706',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                  borderRadius: '10px'
                }}>
                  ❓ HỘP DẤU HỎI MARIO BÍ ẨN
                </span>
              </div>

              {/* Timer */}
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

            {/* Question Text */}
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.4,
              marginBottom: '24px'
            }}>
              {activeQuestion.question}
            </h3>

            {/* Answer Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              {activeQuestion.options.map((opt, idx) => {
                const optionKey = String.fromCharCode(65 + idx);
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

            {/* Result Banner */}
            {isAnswerSubmitted && (
              <div style={{
                background: isCorrect ? '#f0fdf4' : '#fef2f2',
                border: `2px solid ${isCorrect ? '#4ade80' : '#f87171'}`,
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
                    color: isCorrect ? '#166534' : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {isCorrect ? <CheckCircle2 color="#22c55e" size={24} /> : <XCircle color="#ef4444" size={24} />}
                    {isCorrect ? (
                      rewardItem ? (
                        <span>
                          🎉 CHÍNH XÁC! MARIO ĐẬP HỘP BÍ ẨN TRÚNG <b>{rewardItem.icon} {rewardItem.name}</b> ({rewardItem.desc})!
                        </span>
                      ) : (
                        <span>
                          🎉 CHÍNH XÁC! MARIO NHẢY VỌT TIẾN VỀ PHÍA TRƯỚC!
                        </span>
                      )
                    ) : (
                      'RẤT TIẾC, ĐÁP ÁN CHƯA ĐÚNG! MARIO BỊ KHỰNG LẠI! 😅'
                    )}
                  </div>
                  {activeQuestion.explanation && (
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                      💡 {activeQuestion.explanation}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isCorrect && rewardItem && rewardItem.id === 'shell' && (
                    <button
                      onClick={() => setIsSabotageModalOpen(true)}
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
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🐢 Ném Mai Rùa Đỏ Chặn Đội Bạn!
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

      {/* 5. RED SHELL SABOTAGE MODAL */}
      {isSabotageModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.88)',
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
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🐢</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              Vũ Khí Mai Rùa Đỏ Mario
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '8px 0 20px 0' }}>
              Chọn một Mario đối thủ để ném Mai rùa đỏ và chặn đứng đội đó 1 lượt:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {teams.filter(t => t.id !== teams[currentTurnIdx].id).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleApplyShellSabotage(t.id)}
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
                  {t.name} (Ô {t.step})
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSabotageModalOpen(false)}
              style={{ background: '#e2e8f0', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 700 }}
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* 6. VICTORY CELEBRATION SCREEN */}
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
          <div style={{ fontSize: '4.5rem', animation: 'bounceTurnArrow 1s infinite' }}>🏰 👑</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.6)', marginBottom: '8px' }}>
            NHÀ VÔ ĐỊCH MARIO TRI THỨC
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '32px' }}>
            Chúc mừng <b>{winner.name}</b> đã xuất sắc cán đích Lâu đài Mario đầu tiên với <b>{winner.score} Điểm</b>!
          </p>

          {/* Victory Podium */}
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
                  <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{t.step} Ô</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{t.score} điểm</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => {
                setTeams((prev) =>
                  prev.map((t) => ({ ...t, step: 0, score: 0, isStunned: false }))
                );
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

      {/* Global Animations */}
      <style>{`
        @keyframes pulseTurnBtn {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes cloudFloat {
          0% { transform: translateX(0); }
          100% { transform: translateX(100vw); }
        }
      `}</style>
    </div>
  );
}
