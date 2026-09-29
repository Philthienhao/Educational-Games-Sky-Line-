import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Sparkles, Zap, Trophy, RotateCcw, Volume2, CheckCircle2, XCircle, Clock, ArrowRight, ShieldCheck, ArrowLeft, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { parseUploadedFile } from '../../utils/universalParser';

export function FruitNinjaGame({ questions: propQuestions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex, onClose }) {
  const [customQuestions, setCustomQuestions] = useState(null);

  const defaultQs = [
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

  const safeQuestions = customQuestions || (Array.isArray(propQuestions) && propQuestions.length > 0 ? propQuestions : defaultQs);

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

  const currentQ = safeQuestions[currentQIndex % safeQuestions.length] || safeQuestions[0];

  // Infer exact correct answer text with 100% null safety
  const correctAnswerText = useMemo(() => {
    if (!currentQ) return 'Đáp án đúng';
    if (currentQ.correctAnswer) return String(currentQ.correctAnswer).trim();
    if (currentQ.correct && currentQ.options && Array.isArray(currentQ.options) && ['A', 'B', 'C', 'D'].includes(String(currentQ.correct).toUpperCase())) {
      const idx = ['A', 'B', 'C', 'D'].indexOf(String(currentQ.correct).toUpperCase());
      return String(currentQ.options[idx] || currentQ.options[0] || currentQ.correct).trim();
    }
    return String(currentQ.correct || currentQ.answer || 'Đáp án đúng').trim();
  }, [currentQ]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCustomQuestions(parsed);
        try { SoundFX.correct(); } catch(e) {}
        alert(`Đã nhập thành công ${parsed.length} câu hỏi từ tệp ${file.name}!`);
      }
    } catch(err) {
      alert(err.message || 'Lỗi khi nhập tệp câu hỏi.');
    }
  };

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
    if (!currentQ) return;
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
      
      const initialX = Math.floor(Math.random() * Math.max(100, (arenaWidth - 220))) + 20;
      const initialY = Math.floor(Math.random() * (arenaHeight - 120)) + 20;
      
      const vx = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.2);
      const vy = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.2);

      return {
        id: `target_${currentQIndex}_${idx}`,
        text: cand.text,
        isCorrect: cand.isCorrect,
        theme,
        x: initialX,
        y: initialY,
        vx,
        vy
      };
    });

    setTargets(newTargets);
    setPoppedIds(new Set());
    setAnswerState(null);
    setSlashedItem(null);
    setSlashPos(null);
    setTimeLeft(20);
  }, [currentQIndex, currentQ, isGameStarted]);

  // Smooth Wall-Bouncing Animation Loop
  useEffect(() => {
    if (!isGameStarted || answerState) return;

    const updatePhysics = () => {
      const arenaWidth = arenaRef.current ? arenaRef.current.clientWidth : 920;
      const arenaHeight = 440;
      const radius = 68; // Fruit/Balloon radius (136px width / 2)

      setTargets(prevTargets => {
        return prevTargets.map(t => {
          let newX = t.x + t.vx;
          let newY = t.y + t.vy;
          let newVx = t.vx;
          let newVy = t.vy;

          if (newX <= 10) {
            newX = 10;
            newVx = Math.abs(t.vx);
          } else if (newX >= arenaWidth - radius * 2 - 10) {
            newX = arenaWidth - radius * 2 - 10;
            newVx = -Math.abs(t.vx);
          }

          if (newY <= 10) {
            newY = 10;
            newVy = Math.abs(t.vy);
          } else if (newY >= arenaHeight - radius * 2 - 10) {
            newY = arenaHeight - radius * 2 - 10;
            newVy = -Math.abs(t.vy);
          }

          return { ...t, x: newX, y: newY, vx: newVx, vy: newVy };
        });
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isGameStarted, answerState]);

  // 20-second Timer Loop
  useEffect(() => {
    if (!isGameStarted || answerState) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAnswerState('timeout');
          try { SoundFX.wrong(); } catch (e) {}
          return 0;
        }
        if (prev <= 5) {
          try { SoundFX.timerTick(); } catch (e) {}
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameStarted, answerState]);

  const handleSlashItem = (e, item) => {
    if (answerState || poppedIds.has(item.id)) return;

    const rect = arenaRef.current?.getBoundingClientRect();
    const clickX = e.clientX - (rect ? rect.left : 0);
    const clickY = e.clientY - (rect ? rect.top : 0);

    setSlashPos({ x: clickX, y: clickY });

    if (item.isCorrect) {
      setSlashedItem(item);
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

  const activeTeam = (teams && teams[activeTeamIndex]) ? teams[activeTeamIndex] : { name: `Đội ${activeTeamIndex + 1}`, color: '#0d9488' };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999999,
      background: 'linear-gradient(135deg, #07121e 0%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '24px 36px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '14px', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)', fontWeight: 800 }}
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              🍉 Trò Chơi Chém Hoa Quả / Bắt Bong Bóng Va Thành Tường
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
              Bong bóng & Trái cây 3D lơ lửng đập qua lại thành tường! Nhanh mắt chém đúng 1 đáp án chuẩn!
            </p>
          </div>
        </div>

        {/* Team & Timer & File Upload Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', borderRadius: '14px', padding: '8px 14px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #0284c7', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} /> Tải câu hỏi (Excel/Word)
            <input type="file" accept=".xlsx,.xls,.docx,.doc,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

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

      {!isGameStarted ? (
        <StartGameOverlay
          title="Chém Hoa Quả"
          icon="🍉"
          onStart={() => setIsGameStarted(true)}
        />
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px' }}>
        
        {/* Main Question Card */}
        <div style={{
          width: '100%',
          maxWidth: '920px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '20px 28px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
          textAlign: 'center'
        }}>
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc', border: '1px solid #0284c7', fontWeight: 800, padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '8px', display: 'inline-block' }}>
            CÂU HỎI {currentQIndex + 1} / {safeQuestions.length}
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', lineHeight: 1.35 }}>
            {currentQ?.question || 'Câu hỏi...'}
          </h2>
        </div>

        {/* Wall Bouncing Fruit Arena Container */}
        <div 
          ref={arenaRef}
          style={{
            width: '100%',
            maxWidth: '920px',
            height: '440px',
            background: 'radial-gradient(ellipse at 50% 50%, #1e293b 0%, #0f172a 100%)',
            border: '4px solid #334155',
            borderRadius: '28px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 20px 50px rgba(0,0,0,0.5)'
          }}
        >

          {/* Grid Background Lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none'
          }} />

          {/* Blade Slash Laser FX Trail */}
          {slashPos && (
            <div style={{
              position: 'absolute',
              left: `${slashPos.x - 100}px`,
              top: `${slashPos.y - 10}px`,
              height: '20px',
              background: 'linear-gradient(90deg, transparent 0%, #fde047 30%, #ffffff 50%, #fde047 70%, transparent 100%)',
              boxShadow: '0 0 25px #fde047, 0 0 50px #ffffff',
              borderRadius: '10px',
              animation: 'bladeCutLine 0.4s ease-out forwards',
              zIndex: 30,
              pointerEvents: 'none'
            }} />
          )}

          {/* Floating Bouncing Spherical Targets */}
          {targets.map((item) => {
            const isPopped = poppedIds.has(item.id);
            if (isPopped) return null;

            const isWinnerItem = answerState === 'correct' && item.isCorrect;

            return (
              <div
                key={item.id}
                onClick={(e) => handleSlashItem(e, item)}
                style={{
                  position: 'absolute',
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: '136px',
                  height: '136px',
                  borderRadius: '50%',
                  background: item.theme.gradient,
                  border: `3px solid ${item.theme.border}`,
                  boxShadow: isWinnerItem ? '0 0 50px #fde047, 0 10px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.35)',
                  cursor: answerState ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  textAlign: 'center',
                  color: '#ffffff',
                  userSelect: 'none',
                  zIndex: isWinnerItem ? 25 : 10,
                  transition: isWinnerItem ? 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                  animation: isWinnerItem ? 'goldGlowPulse 1.2s infinite' : 'none'
                }}
              >
                <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: '2px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
                  {item.theme.fruit}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.text}
                </div>
              </div>
            );
          })}

          {/* Answer Outcome Banner */}
          {answerState && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: answerState === 'correct' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '14px 28px',
              borderRadius: '20px',
              border: answerState === 'correct' ? '2px solid #6ee7b7' : '2px solid #fca5a5',
              boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              zIndex: 40,
              maxWidth: '85%'
            }}>
              <div style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {answerState === 'correct' ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                    {answerState === 'correct' ? `🎉 CHÍNH XÁC! CỘNG +100 ĐIỂM DÀNH CHO ${activeTeam.name}!` : `❌ HẾT GIỜ / CHƯA ĐÚNG!`}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.95, marginTop: '2px' }}>
                    Đáp án đúng: <strong>{correctAnswerText}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="btn btn-primary"
                style={{
                  background: '#ffffff',
                  color: answerState === 'correct' ? '#047857' : '#b91c1c',
                  border: 'none',
                  fontWeight: 900,
                  padding: '10px 20px',
                  borderRadius: '14px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Câu Tiếp <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
      )}

    </div>,
    document.body
  );
}
