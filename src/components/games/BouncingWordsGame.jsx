import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Sparkles, Trophy, Pause, Play, Eye, RotateCcw, Volume2, VolumeX, ArrowRight, Upload, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { parseUploadedFile } from '../../utils/universalParser';

const PASTEL_COLORS = [
  '#ffe4e6', '#fef3c7', '#dcfce7', '#e0e7ff', '#f3e8ff', '#fae8ff', '#e0f2fe'
];

const BORDER_COLORS = [
  '#f43f5e', '#d97706', '#16a34a', '#4f46e5', '#9333ea', '#c026d3', '#0284c7'
];

export function BouncingWordsGame({ questions: propQuestions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex, onClose }) {
  const [customQuestions, setCustomQuestions] = useState(null);

  const defaultQs = [
    {
      id: 'bw1',
      question: 'She is happy.',
      hint: 'Hãy xếp các từ đang bay thành câu hoàn chỉnh:',
      words: ['She', 'is', 'happy.'],
      distractors: ['not', 'very']
    },
    {
      id: 'bw2',
      question: 'The dog is sleeping.',
      hint: 'Hãy nhìn thật nhanh và viết lại thành câu:',
      words: ['The', 'dog', 'is', 'sleeping.'],
      distractors: ['cat', 'run']
    },
    {
      id: 'bw3',
      question: 'Học sinh Sky-Line chăm ngoan.',
      hint: 'Hãy ghép từ thành câu hoàn chỉnh:',
      words: ['Học sinh', 'Sky-Line', 'chăm ngoan.'],
      distractors: ['lười', 'vui']
    },
    {
      id: 'bw4',
      question: 'Trái Đất quay quanh Mặt Trời.',
      hint: 'Xếp lại câu đúng:',
      words: ['Trái Đất', 'quay', 'quanh', 'Mặt Trời.'],
      distractors: ['Mặt Trăng', 'đứng']
    }
  ];

  const safeQuestions = useMemo(() => {
    if (customQuestions && customQuestions.length > 0) return customQuestions;
    if (Array.isArray(propQuestions) && propQuestions.length > 0) {
      return propQuestions.map((q, idx) => {
        let text = q.question || q.text || '';
        let wordList = q.words || text.split(' ').filter(w => w.trim() !== '');
        return {
          id: `bw_prop_${idx}`,
          question: text,
          hint: q.explanation || 'Hãy nhìn thật nhanh và ghép từ thành câu đúng:',
          words: wordList,
          distractors: q.options ? q.options.filter(o => !wordList.includes(o)).slice(0, 2) : []
        };
      });
    }
    return defaultQs;
  }, [propQuestions, customQuestions]);

  const [isStarted, setIsStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userSelectedWords, setUserSelectedWords] = useState([]);
  const [typedInput, setTypedInput] = useState('');
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct' | 'wrong'
  const [showAnswer, setShowAnswer] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const arenaRef = useRef(null);
  const animFrameRef = useRef(null);

  const currentQ = safeQuestions[currentIdx % safeQuestions.length];

  // Prepare bouncing cards data (target words + distractors)
  const [cards, setCards] = useState([]);

  const initCards = () => {
    if (!currentQ) return;
    const allWords = [...(currentQ.words || []), ...(currentQ.distractors || [])];
    // Shuffle words
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);

    const initialCards = shuffled.map((word, idx) => {
      const colorIdx = idx % PASTEL_COLORS.length;
      return {
        id: `card_${idx}_${Date.now()}`,
        word,
        x: Math.random() * 60 + 20, // percentage 20%-80%
        y: Math.random() * 50 + 20, // percentage 20%-70%
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        bgColor: PASTEL_COLORS[colorIdx],
        borderColor: BORDER_COLORS[colorIdx]
      };
    });
    setCards(initialCards);
  };

  useEffect(() => {
    if (isStarted) {
      initCards();
      setUserSelectedWords([]);
      setTypedInput('');
      setAnswerStatus(null);
      setShowAnswer(false);
      setTimeLeft(30);
    }
  }, [currentIdx, isStarted]);

  // Timer tick
  useEffect(() => {
    if (!isStarted || isPaused || answerStatus === 'correct' || showAnswer) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isMuted) SoundFX.wrong();
          setAnswerStatus('wrong');
          return 0;
        }
        if (prev <= 6 && !isMuted) {
          SoundFX.timerUrgentTick(1 + (6 - prev) * 0.15);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, isPaused, answerStatus, showAnswer, isMuted]);

  // Bouncing Physics Animation Loop
  useEffect(() => {
    if (!isStarted || isPaused || answerStatus === 'correct') return;

    let lastTime = performance.now();

    const updatePhysics = (now) => {
      const delta = Math.min((now - lastTime) / 16, 2);
      lastTime = now;

      setCards(prevCards =>
        prevCards.map(c => {
          let nx = c.x + c.vx * delta;
          let ny = c.y + c.vy * delta;
          let nvx = c.vx;
          let nvy = c.vy;

          if (nx <= 5 || nx >= 85) {
            nvx = -nvx;
            nx = Math.max(5, Math.min(85, nx));
          }
          if (ny <= 10 || ny >= 75) {
            nvy = -nvy;
            ny = Math.max(10, Math.min(75, ny));
          }

          return { ...c, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isStarted, isPaused, answerStatus]);

  const handleCardClick = (card) => {
    if (answerStatus === 'correct' || showAnswer) return;
    if (!isMuted) SoundFX.click();
    setUserSelectedWords(prev => [...prev, card.word]);
  };

  const handleRemoveWord = (index) => {
    if (!isMuted) SoundFX.click();
    setUserSelectedWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    const userString = userSelectedWords.length > 0 
      ? userSelectedWords.join(' ').trim() 
      : typedInput.trim();
    
    const targetString = (currentQ.question || '').trim();

    // Clean comparison (ignore punctuation & spaces)
    const cleanUser = userString.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");
    const cleanTarget = targetString.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");

    if (cleanUser === cleanTarget) {
      if (!isMuted) SoundFX.correct();
      setAnswerStatus('correct');
      setCombo(c => c + 1);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      if (onAddPoints) onAddPoints(activeTeamIndex, 10);
    } else {
      if (!isMuted) SoundFX.wrong();
      setAnswerStatus('wrong');
      setCombo(0);
    }
  };

  const handleNextQuestion = () => {
    setCurrentIdx(prev => prev + 1);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed && parsed.length > 0) {
        setCustomQuestions(parsed);
        setCurrentIdx(0);
        alert(`Đã tải lên ${parsed.length} câu hỏi thành công!`);
      }
    } catch (err) {
      alert('Không thể đọc file: ' + err.message);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#fffdf5',
      fontFamily: "'Inter', sans-serif",
      color: '#1e293b',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {!isStarted && (
        <StartGameOverlay
          title="TỪ ƠI, ĐỨNG LẠI!"
          subtitle="Thử Thách Quan Sát Nhanh & Xếp Thẻ Từ Bay Thành Câu"
          icon="☁️"
          gradient="linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)"
          onStart={() => setIsStarted(true)}
          onUpload={handleFileUpload}
        />
      )}

      {/* Top Header Controls Bar */}
      <div style={{
        padding: '12px 24px',
        background: '#ffffff',
        borderBottom: '2px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        zIndex: 10
      }}>
        {/* Title & Question badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            style={{ fontSize: '1.2rem' }}
          >
            ✕
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>☁️</span>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f43f5e', letterSpacing: '-0.5px' }}>
              TỪ ƠI, ĐỨNG LẠI!
            </span>
            <span style={{
              background: '#ffe4e6',
              color: '#e11d48',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '4px 12px',
              borderRadius: '20px'
            }}>
              Câu {currentIdx + 1} / {safeQuestions.length}
            </span>
          </div>
        </div>

        {/* Timer & Team & Combo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: timeLeft <= 5 ? '#fef2f2' : '#eff6ff',
            color: timeLeft <= 5 ? '#ef4444' : '#2563eb',
            border: `2px solid ${timeLeft <= 5 ? '#fca5a5' : '#bfdbfe'}`,
            padding: '6px 18px',
            borderRadius: '16px',
            fontWeight: 900,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⏱️ 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>

          {teams && teams.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Đội lượt:</span>
              <select
                value={activeTeamIndex}
                onChange={(e) => setActiveTeamIndex(Number(e.target.value))}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontWeight: 800,
                  color: teams[activeTeamIndex]?.color || '#1e293b'
                }}
              >
                {teams.map((t, i) => (
                  <option key={t.id} value={i}>
                    {t.name} ({t.score} điểm)
                  </option>
                ))}
              </select>
            </div>
          )}

          {combo > 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              fontWeight: 900,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
            }}>
              🔥 COMBO x{combo}
            </div>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: isPaused ? '#fef3c7' : '#f8fafc',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div
        ref={arenaRef}
        style={{
          flex: 1,
          position: 'relative',
          background: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px'
        }}
      >
        {/* Floating Word Cards Arena Container */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '220px',
          pointerEvents: isPaused ? 'none' : 'auto'
        }}>
          {cards.map(card => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                position: 'absolute',
                left: `${card.x}%`,
                top: `${card.y}%`,
                background: card.bgColor,
                border: `3px solid ${card.borderColor}`,
                borderRadius: '18px',
                padding: '14px 28px',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: '#1e293b',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                transform: 'translate(-50%, -50%) scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
              }}
            >
              {card.word}
            </div>
          ))}
        </div>

        {/* Bottom Input & Answer Workspace */}
        <div style={{
          marginTop: 'auto',
          zIndex: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '2px solid #e2e8f0',
          borderRadius: '24px',
          padding: '20px 24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Hint Label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#64748b' }}>
              💡 {currentQ.hint || 'Hãy nhìn thật nhanh và viết lại thành câu hoàn chỉnh:'}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  color: '#d97706',
                  border: '1px solid #fde68a',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={16} /> Xem Đáp Án
              </button>
            </div>
          </div>

          {/* Answer Display Strip / Chips */}
          <div style={{
            minHeight: '60px',
            background: '#f8fafc',
            border: answerStatus === 'correct' 
              ? '2px solid #22c55e' 
              : answerStatus === 'wrong' 
                ? '2px solid #ef4444' 
                : '2px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {userSelectedWords.length > 0 ? (
              userSelectedWords.map((w, idx) => (
                <span
                  key={idx}
                  onClick={() => handleRemoveWord(idx)}
                  style={{
                    background: '#ffffff',
                    border: '2px solid #94a3b8',
                    borderRadius: '12px',
                    padding: '6px 14px',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    color: '#0f172a',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {w} <X size={14} style={{ color: '#ef4444' }} />
                </span>
              ))
            ) : (
              <input
                type="text"
                placeholder="Bấm vào các từ đang bay ở trên hoặc gõ câu trả lời vào đây..."
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#0f172a'
                }}
              />
            )}
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                setUserSelectedWords([]);
                setTypedInput('');
                setAnswerStatus(null);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontWeight: 800,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              🔄 Xóa chọn
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCheckAnswer}
                style={{
                  padding: '10px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Check size={18} /> KIỂM TRA
              </button>

              <button
                onClick={handleNextQuestion}
                style={{
                  padding: '10px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                CÂU TIẾP <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Reveal Answer */}
        {showAnswer && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ffffff',
            border: '3px solid #f59e0b',
            borderRadius: '24px',
            padding: '24px 36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            zIndex: 100,
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#d97706', fontWeight: 900, marginBottom: '8px' }}>
              💡 ĐÁP ÁN ĐÚNG
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
              "{currentQ.question}"
            </p>
            <button
              onClick={() => setShowAnswer(false)}
              className="btn btn-accent btn-sm"
              style={{ borderRadius: '12px', fontWeight: 800 }}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
