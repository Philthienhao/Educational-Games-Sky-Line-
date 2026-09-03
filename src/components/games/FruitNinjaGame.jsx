import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Zap, Trophy, RotateCcw, Volume2, CheckCircle2, XCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';

export function FruitNinjaGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const safeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : [
    {
      question: 'Tỉnh/Thành phố nào thuộc khu vực Đông Nam Bộ Việt Nam?',
      correct: 'Bình Dương',
      distractors: ['Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Lào Cai', 'Bắc Ninh', 'Lạng Sơn', 'Cà Mau', 'Cần Thơ', 'Huế']
    },
    {
      question: 'Ký hiệu hóa học của nguyên tố Vàng trong bảng tuần hoàn là gì?',
      correct: 'Au',
      distractors: ['Ag', 'Fe', 'Cu', 'Pb', 'Hg', 'Zn', 'Al', 'Na', 'Ca']
    },
    {
      question: 'Số nào sau đây là số nguyên tố?',
      correct: '17',
      distractors: ['4', '6', '8', '9', '12', '15', '18', '21', '25']
    }
  ];

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerState, setAnswerState] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [slashedItem, setSlashedItem] = useState(null);
  const [slashPos, setSlashPos] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [poppedIds, setPoppedIds] = useState(new Set());

  const arenaRef = useRef(null);
  const animFrameRef = useRef(null);
  const [targets, setTargets] = useState([]);

  const currentQ = safeQuestions[currentQIndex % safeQuestions.length];

  // Infer exact correct answer text
  const correctAnswerText = useMemo(() => {
    if (currentQ.correctAnswer) return String(currentQ.correctAnswer).trim();
    if (currentQ.correct && currentQ.options && ['A', 'B', 'C', 'D'].includes(String(currentQ.correct).toUpperCase())) {
      const idx = ['A', 'B', 'C', 'D'].indexOf(String(currentQ.correct).toUpperCase());
      return String(currentQ.options[idx] || currentQ.options[0]).trim();
    }
    return String(currentQ.correct || currentQ.answer || 'Đáp án đúng').trim();
  }, [currentQ]);

  // 3D Spherical Fruit & Balloon Themes
  const THEMES = [
    { fruit: '🍉', gradient: 'radial-gradient(circle at 35% 35%, #ff5252 0%, #d32f2f 65%, #880e4f 100%)', border: '#ff8a80' },
    { fruit: '🍌', gradient: 'radial-gradient(circle at 35% 35%, #ffee58 0%, #fbc02d 65%, #f57f17 100%)', border: '#fff59d' },
    { fruit: '🍎', gradient: 'radial-gradient(circle at 35% 35%, #ff4081 0%, #c2185b 65%, #880e4f 100%)', border: '#ff80ab' },
    { fruit: '🍊', gradient: 'radial-gradient(circle at 35% 35%, #ff9800 0%, #f57c00 65%, #e65100 100%)', border: '#ffb74d' },
    { fruit: '🍇', gradient: 'radial-gradient(circle at 35% 35%, #ab47bc 0%, #7b1fa2 65%, #4a148c 100%)', border: '#ce93d8' },
    { fruit: '🍍', gradient: 'radial-gradient(circle at 35% 35%, #ffca28 0%, #ffa000 65%, #ff6f00 100%)', border: '#ffe082' },
    { fruit: '🥭', gradient: 'radial-gradient(circle at 35% 35%, #ff7043 0%, #e64a19 65%, #bf360c 100%)', border: '#ffab91' },
    { fruit: '🍐', gradient: 'radial-gradient(circle at 35% 35%, #9ccc65 0%, #689f38 65%, #33691e 100%)', border: '#c5e1a5' },
    { fruit: '🍓', gradient: 'radial-gradient(circle at 35% 35%, #ff1744 0%, #d50000 65%, #8a0000 100%)', border: '#ff8a80' },
    { fruit: '🎈', gradient: 'radial-gradient(circle at 35% 35%, #29b6f6 0%, #0288d1 65%, #01579b 100%)', border: '#81d4fa' },
    { fruit: '🟢', gradient: 'radial-gradient(circle at 35% 35%, #26a69a 0%, #00796b 65%, #004d40 100%)', border: '#80cbc4' }
  ];

  // Initialize targets with random positions and bouncing velocity vectors
  useEffect(() => {
    let distractorsList = [];
    if (Array.isArray(currentQ.distractors) && currentQ.distractors.length > 0) {
      distractorsList = currentQ.distractors;
    } else if (Array.isArray(currentQ.options) && currentQ.options.length > 0) {
      distractorsList = currentQ.options.filter(opt => String(opt).trim().toLowerCase() !== correctAnswerText.toLowerCase());
      const fallbackExtra = ['Phương án X', 'Đáp án nhiễu 1', 'Đáp án nhiễu 2', 'Không chính xác', 'Kết quả sai'];
      distractorsList = [...distractorsList, ...fallbackExtra];
    } else {
      distractorsList = ['Phương án Sai 1', 'Phương án Sai 2', 'Phương án Sai 3', 'Phương án Sai 4', 'Phương án Sai 5'];
    }

    const chosenDistractors = Array.from(new Set(distractorsList.map(s => String(s).trim())))
      .filter(s => s.toLowerCase() !== correctAnswerText.toLowerCase())
      .slice(0, 7);

    const rawCandidates = [
      { text: correctAnswerText, isCorrect: true },
      ...chosenDistractors.map(d => ({ text: d, isCorrect: false }))
    ];

    const shuffled = [...rawCandidates].sort(() => Math.random() - 0.5);

    const arenaWidth = arenaRef.current ? arenaRef.current.clientWidth : 920;
    const arenaHeight = 440;

    const newTargets = shuffled.map((cand, idx) => {
      const theme = THEMES[idx % THEMES.length];
      
      // Randomize initial positions cleanly spread across arena
      const initialX = Math.floor(Math.random() * (arenaWidth - 220)) + 20;
      const initialY = Math.floor(Math.random() * (arenaHeight - 120)) + 20;
      
      // Randomize bouncing velocities (between 1.2 and 2.4 px/frame)
      const dirX = Math.random() > 0.5 ? 1 : -1;
      const dirY = Math.random() > 0.5 ? 1 : -1;
      const vx = (1.2 + Math.random() * 1.2) * dirX;
      const vy = (1.1 + Math.random() * 1.2) * dirY;

      return {
        id: `target_${idx}_${Date.now()}`,
        text: cand.text,
        isCorrect: cand.isCorrect,
        fruit: theme.fruit,
        gradient: theme.gradient,
        borderColor: theme.border,
        x: initialX,
        y: initialY,
        vx: vx,
        vy: vy,
        rotation: (Math.random() * 16 - 8),
        vRot: (Math.random() * 0.4 - 0.2)
      };
    });

    setTargets(newTargets);
    setAnswerState(null);
    setPoppedIds(new Set());
    setSlashedItem(null);
    setSlashPos(null);
  }, [currentQIndex, safeQuestions, correctAnswerText]);

  // 2D Bouncing Physics Engine (Wall Collision Bouncing Loop)
  useEffect(() => {
    if (answerState === 'correct' || answerState === 'timeout') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const updatePhysics = () => {
      const arenaW = arenaRef.current ? arenaRef.current.clientWidth : 920;
      const arenaH = 440;

      setTargets(prevTargets => {
        return prevTargets.map(t => {
          let newX = t.x + t.vx;
          let newY = t.y + t.vy;
          let newVx = t.vx;
          let newVy = t.vy;
          let newRot = t.rotation + t.vRot;

          // Estimate target pill width & height dynamically
          const estimatedW = Math.max(150, Math.min(240, t.text.length * 11 + 75));
          const estimatedH = 65;

          // Bounce off Left & Right walls
          if (newX <= 12) {
            newX = 12;
            newVx = Math.abs(t.vx);
          } else if (newX >= arenaW - estimatedW - 12) {
            newX = arenaW - estimatedW - 12;
            newVx = -Math.abs(t.vx);
          }

          // Bounce off Top & Bottom walls
          if (newY <= 12) {
            newY = 12;
            newVy = Math.abs(t.vy);
          } else if (newY >= arenaH - estimatedH - 12) {
            newY = arenaH - estimatedH - 12;
            newVy = -Math.abs(t.vy);
          }

          return {
            ...t,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: newRot
          };
        });
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [answerState]);

  // 20-Second Countdown Timer
  useEffect(() => {
    if (!isGameStarted || answerState) return;
    setTimeLeft(20);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAnswerState('timeout');
          try { SoundFX.wrong(); } catch (e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameStarted, currentQIndex, activeTeamIndex, answerState]);

  // Handle Slash / Click on Bouncing Target
  const handleSlashTarget = (e, item) => {
    if (answerState === 'correct' || answerState === 'timeout' || poppedIds.has(item.id)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setSlashPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSlashedItem(item);

    if (item.isCorrect) {
      setAnswerState('correct');
      try { SoundFX.correct(); } catch (e) {}
      try { confetti({ particleCount: 130, spread: 100, origin: { y: 0.55 } }); } catch (e) {}
      if (onAddPoints) onAddPoints(activeTeamIndex, 100);
    } else {
      setPoppedIds(prev => new Set([...prev, item.id]));
      try { SoundFX.wrong(); } catch (e) {}
    }
  };

  const handleNextQuestion = () => {
    setAnswerState(null);
    setSlashedItem(null);
    setSlashPos(null);
    setPoppedIds(new Set());
    setCurrentQIndex(prev => (prev + 1) % safeQuestions.length);
    if (setActiveTeamIndex && teams && teams.length > 1) {
      setActiveTeamIndex(prev => (prev + 1) % teams.length);
    }
  };

  const activeTeam = teams && teams[activeTeamIndex] ? teams[activeTeamIndex] : { name: `Đội ${activeTeamIndex + 1}`, color: '#0d9488' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 16px', width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      
      {/* KEYFRAMES & SLASH FX ANIMATIONS */}
      <style>{`
        @keyframes bladeCutLine {
          0% { width: 0px; opacity: 1; transform: rotate(-30deg) scale(0.8); }
          50% { width: 160px; opacity: 1; transform: rotate(-30deg) scale(1.1); }
          100% { width: 200px; opacity: 0; transform: rotate(-30deg) scale(1.2); }
        }
        @keyframes goldGlowPulse {
          0%, 100% { transform: scale(1.08); box-shadow: 0 0 40px #fde047, 0 10px 30px rgba(0,0,0,0.5); }
          50% { transform: scale(1.15); box-shadow: 0 0 60px #fde047, 0 15px 45px rgba(253, 224, 71, 0.8); }
        }
        .pop-burst-out {
          animation: popOutAnim 0.3s ease-out forwards;
        }
        @keyframes popOutAnim {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35) rotate(15deg); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
      `}</style>

      {/* Header Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            🍉 Trò Chơi Chém Hoa Quả / Bắt Bong Bóng Va Thành Tường
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
            Bong bóng & Trái cây 3D lơ lửng đập qua lại thành tường! Nhanh mắt chém đúng 1 đáp án chuẩn!
          </p>
        </div>

        {/* Team & Timer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Active Team Indicator */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: `2px solid ${activeTeam.color || '#0d9488'}`,
            padding: '8px 16px',
            borderRadius: '16px',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 4px 15px ${activeTeam.color || '#0d9488'}40`
          }}>
            <Trophy size={16} color="#fde047" />
            <span>ĐẾN LƯỢT: <strong style={{ color: activeTeam.color || '#5eead4' }}>{activeTeam.name}</strong></span>
          </div>

          {/* 20-Second Timer Badge */}
          <div style={{
            background: timeLeft <= 5 ? '#ef4444' : '#0d9488',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '16px',
            fontWeight: 900,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'background 0.3s'
          }}>
            <Clock size={18} />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Main Question Display Box */}
      {!isGameStarted ? (
        <StartGameOverlay
          title="Chém Hoa Quả Tri Thức"
          icon="🍉"
          onStart={() => setIsGameStarted(true)}
        />
      ) : (
        <>
          <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '2px solid rgba(13, 148, 136, 0.4)',
        borderRadius: '24px',
        padding: '20px 28px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#5eead4', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
          CÂU HỎI {currentQIndex + 1} / {safeQuestions.length}
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.45, margin: 0 }}>
          {currentQ.question}
        </h3>
      </div>

      {/* 2D WALL-BOUNCING ARENA CONTAINER */}
      <div 
        ref={arenaRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '440px',
          background: 'radial-gradient(circle at center, #0b1a28 0%, #030910 100%)',
          borderRadius: '24px',
          border: '3px solid rgba(13, 148, 136, 0.5)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8), 0 12px 35px rgba(0,168,150,0.2)'
        }}
      >
        {/* Arena Wall Boundary Decor */}
        <div style={{
          position: 'absolute',
          inset: '6px',
          border: '1.5px dashed rgba(94, 234, 212, 0.25)',
          borderRadius: '18px',
          pointerEvents: 'none'
        }} />

        {/* Dynamic Bouncing 3D Spherical Fruit & Balloon Targets */}
        {targets.map(item => {
          const isPopped = poppedIds.has(item.id);
          if (isPopped) return null;

          const isAnswered = answerState === 'correct' || answerState === 'timeout';
          const isWinnerTarget = item.isCorrect && isAnswered;

          return (
            <div
              key={item.id}
              onClick={(e) => handleSlashTarget(e, item)}
              style={{
                position: 'absolute',
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: `rotate(${item.rotation}deg)`,
                background: isWinnerTarget 
                  ? 'radial-gradient(circle at 35% 35%, #4ade80 0%, #16a34a 65%, #14532d 100%)' 
                  : item.gradient,
                borderRadius: '50px', // 3D Capsule Pill Shape
                padding: '10px 20px 10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: isWinnerTarget ? '3px solid #fde047' : `2px solid ${item.borderColor}`,
                boxShadow: isWinnerTarget 
                  ? '0 0 45px #fde047, 0 10px 35px rgba(0,0,0,0.6)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.45), inset 0 3px 6px rgba(255,255,255,0.45)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: isAnswered ? 'default' : 'pointer',
                userSelect: 'none',
                zIndex: isWinnerTarget ? 40 : 10,
                animation: isWinnerTarget ? 'goldGlowPulse 1.5s infinite' : 'none',
                transition: isAnswered ? 'transform 0.4s ease' : 'none',
                backdropFilter: 'blur(4px)'
              }}
            >
              {/* 3D Circular Fruit Emblem */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.28)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.65rem',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.7), 0 3px 8px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}>
                {item.fruit}
              </div>

              {/* Glassmorphic Answer Text */}
              <span style={{
                whiteSpace: 'nowrap',
                textShadow: '0 2px 5px rgba(0, 0, 0, 0.85)',
                letterSpacing: '0.2px'
              }}>
                {item.text}
              </span>
            </div>
          );
        })}

        {/* Blade Slash Cut Line Overlay */}
        {slashPos && (
          <div style={{
            position: 'absolute',
            left: slashPos.x - 80,
            top: slashPos.y - 10,
            height: '18px',
            background: 'linear-gradient(90deg, transparent, #ffffff, #5eead4, transparent)',
            borderRadius: '10px',
            boxShadow: '0 0 25px #5eead4',
            animation: 'bladeCutLine 0.35s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 60
          }} />
        )}
      </div>

      {/* REVEAL CORRECT ANSWER BANNER AT BOTTOM */}
      {answerState && (
        <div style={{
          width: '100%',
          background: answerState === 'correct' 
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
            : answerState === 'timeout'
              ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          borderRadius: '20px',
          padding: '20px 24px',
          color: '#ffffff',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', color: '#fde047', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {answerState === 'correct' ? (
                <> <CheckCircle2 size={18} /> ĐÃ CHÉM CHÍNH XÁC! (+100 ĐIỂM) </>
              ) : answerState === 'timeout' ? (
                <> <Clock size={18} /> ĐÃ HẾT GIỜ (20 GIÂY) </>
              ) : (
                <> <XCircle size={18} /> CHƯA ĐÚNG </>
              )}
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.3 }}>
              ✨ ĐÁP ÁN ĐÚNG LÀ: <span style={{ color: '#fde047', textDecoration: 'underline' }}>{correctAnswerText}</span>
            </div>

            {currentQ.explanation && (
              <p style={{ fontSize: '0.85rem', color: '#f1f5f9', marginTop: '6px', margin: '6px 0 0 0' }}>
                💡 Gợi ý / Giải thích: {currentQ.explanation}
              </p>
            )}
          </div>

          <button
            onClick={handleNextQuestion}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 900,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span>Câu Tiếp Theo</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
        </>
      )}

    </div>
  );
}
