import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Heart, RefreshCw, Volume2, Sparkles, Zap, Check, X, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { parseUploadedFile } from '../../utils/universalParser';

export function PirateShipBattleGame({ questions: propQuestions, game, teams, onAddPoints, onClose }) {
  const [customQuestions, setCustomQuestions] = useState(null);

  const defaultQs = [
    {
      id: 'ps1',
      question: 'vložky do bo_',
      options: ['i', 'í', 'y', 'ý'],
      correct: 'bot'
    },
    {
      id: 'ps2',
      question: 'dlouh_ den',
      options: ['i', 'í', 'y', 'ý'],
      correct: 'ý'
    },
    {
      id: 'ps3',
      question: 'Từ nào viết đúng chính tả?',
      options: ['Sắp xếp', 'Xắp xếp', 'Sắp xết', 'Xắp xết'],
      correct: 'A'
    },
    {
      id: 'ps4',
      question: 'Sông Cửu Long chảy ra biển qua bao nhiêu cửa sông?',
      options: ['9 cửa', '7 cửa', '5 cửa', '12 cửa'],
      correct: 'A'
    }
  ];

  const activeQuestionsList = useMemo(() => {
    if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
      return customQuestions;
    }
    if (Array.isArray(propQuestions) && propQuestions.length > 0) {
      return propQuestions;
    }
    if (game?.questions && Array.isArray(game.questions) && game.questions.length > 0) {
      return game.questions;
    }
    if (game?.defaultQuestions && Array.isArray(game.defaultQuestions) && game.defaultQuestions.length > 0) {
      return game.defaultQuestions;
    }
    return defaultQs;
  }, [customQuestions, propQuestions, game]);

  const safeQuestions = useMemo(() => {
    return activeQuestionsList.map((q, idx) => {
      let qText = q.question || q.questionText || q.title || q.content || `Câu ${idx + 1}`;
      let opts = [];
      if (Array.isArray(q.options) && q.options.length >= 2) {
        opts = q.options;
      } else if (Array.isArray(q.choices) && q.choices.length >= 2) {
        opts = q.choices;
      } else if (Array.isArray(q.answers) && q.answers.length >= 2) {
        opts = q.answers;
      } else {
        opts = ['A. Đáp án A', 'B. Đáp án B', 'C. Đáp án C', 'D. Đáp án D'];
      }

      let corr = q.correct ?? q.answer ?? q.correctAnswer ?? 'A';
      if (typeof corr === 'number') {
        corr = ['A', 'B', 'C', 'D'][corr] || 'A';
      } else {
        corr = String(corr).trim().toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(corr)) {
          const foundIdx = opts.findIndex(o => String(o).trim().toLowerCase() === String(q.correct || '').trim().toLowerCase());
          if (foundIdx !== -1) {
            corr = ['A', 'B', 'C', 'D'][foundIdx];
          } else {
            corr = 'A';
          }
        }
      }

      return {
        id: q.id || `ps_q_${idx}`,
        question: qText,
        options: opts,
        correct: corr
      };
    });
  }, [activeQuestionsList]);

  const maxHp = safeQuestions.length > 0 ? safeQuestions.length : 10;

  const [isStarted, setIsStarted] = useState(false);
  const [p1Hp, setP1Hp] = useState(maxHp);
  const [p2Hp, setP2Hp] = useState(maxHp);

  const team1Name = teams?.[0]?.name || 'Đội 1';
  const team2Name = teams?.[1]?.name || 'Đội 2';

  // Sync HP when safeQuestions or maxHp changes (e.g. custom upload or prop questions change)
  useEffect(() => {
    setP1Hp(maxHp);
    setP2Hp(maxHp);
  }, [maxHp]);

  const [p1QIndex, setP1QIndex] = useState(0);
  const [p2QIndex, setP2QIndex] = useState(1);

  const [p1Selected, setP1Selected] = useState(null);
  const [p2Selected, setP2Selected] = useState(null);

  // Cannon firing animation state
  const [cannonShot, setCannonShot] = useState(null); // { shooter: 1 | 2, progress: 0-1 }
  const [screenShake, setScreenShake] = useState(false);
  const [winner, setWinner] = useState(null); // 1 | 2

  const p1CurrentQ = safeQuestions[p1QIndex % safeQuestions.length];
  const p2CurrentQ = safeQuestions[p2QIndex % safeQuestions.length];

  // Cannonball Arc trajectory loop
  useEffect(() => {
    if (!cannonShot) return;
    const interval = setInterval(() => {
      setCannonShot(prev => {
        if (!prev) return null;
        if (prev.progress >= 1) {
          clearInterval(interval);
          // Impact explosion!
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 300);
          if (!SoundFX.wrong) SoundFX.wrong();

          if (prev.shooter === 1) {
            setP2Hp(hp => {
              const nextHp = Math.max(0, hp - 1);
              if (nextHp === 0) setWinner(1);
              return nextHp;
            });
          } else {
            setP1Hp(hp => {
              const nextHp = Math.max(0, hp - 1);
              if (nextHp === 0) setWinner(2);
              return nextHp;
            });
          }
          return null;
        }
        return { ...prev, progress: prev.progress + 0.08 };
      });
    }, 30);
    return () => clearInterval(interval);
  }, [cannonShot]);

  useEffect(() => {
    if (winner) {
      SoundFX.fanfare();
      confetti({ particleCount: 120, spread: 90 });
    }
  }, [winner]);

  const handleP1Answer = (optIndex, optValue) => {
    if (cannonShot || winner) return;
    setP1Selected(optIndex);

    // Check correctness
    let isRight = false;
    if (p1CurrentQ.correct === 'A' && optIndex === 0) isRight = true;
    else if (p1CurrentQ.correct === 'B' && optIndex === 1) isRight = true;
    else if (p1CurrentQ.correct === 'C' && optIndex === 2) isRight = true;
    else if (p1CurrentQ.correct === 'D' && optIndex === 3) isRight = true;
    else if (optValue === p1CurrentQ.correct) isRight = true;

    if (isRight) {
      SoundFX.correct();
      if (onAddPoints) onAddPoints(0, 10);
      // Fire cannonball from Ship 1 to Ship 2
      setCannonShot({ shooter: 1, progress: 0 });
    } else {
      SoundFX.wrong();
    }

    setTimeout(() => {
      setP1Selected(null);
      setP1QIndex(prev => prev + 2);
    }, 1200);
  };

  const handleP2Answer = (optIndex, optValue) => {
    if (cannonShot || winner) return;
    setP2Selected(optIndex);

    let isRight = false;
    if (p2CurrentQ.correct === 'A' && optIndex === 0) isRight = true;
    else if (p2CurrentQ.correct === 'B' && optIndex === 1) isRight = true;
    else if (p2CurrentQ.correct === 'C' && optIndex === 2) isRight = true;
    else if (p2CurrentQ.correct === 'D' && optIndex === 3) isRight = true;
    else if (optValue === p2CurrentQ.correct) isRight = true;

    if (isRight) {
      SoundFX.correct();
      if (onAddPoints) onAddPoints(1, 10);
      // Fire cannonball from Ship 2 to Ship 1
      setCannonShot({ shooter: 2, progress: 0 });
    } else {
      SoundFX.wrong();
    }

    setTimeout(() => {
      setP2Selected(null);
      setP2QIndex(prev => prev + 2);
    }, 1200);
  };

  const resetBattle = () => {
    setP1Hp(maxHp);
    setP2Hp(maxHp);
    setP1QIndex(0);
    setP2QIndex(1);
    setP1Selected(null);
    setP2Selected(null);
    setCannonShot(null);
    setWinner(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed && parsed.length > 0) {
        setCustomQuestions(parsed);
        resetBattle();
        alert(`Đã tải lên ${parsed.length} câu hỏi thành công!`);
      }
    } catch (err) {
      alert('Lỗi đọc file: ' + err.message);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {!isStarted && (
        <StartGameOverlay
          title="ĐẠI CHIẾN TÀU CƯỚP BIỂN"
          subtitle="Bắn Đại Bác Giảm Máu Tàu Đối Phương TRÊN BIỂN - Máu Tương Ứng Số Câu Hỏi"
          icon="🏴‍☠️"
          gradient="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
          onStart={() => setIsStarted(true)}
          onUpload={handleFileUpload}
        />
      )}

      {/* Top Header */}
      <div style={{
        padding: '12px 24px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost" style={{ color: '#fff' }}>
            ✕
          </button>
          <span style={{ fontSize: '1.4rem' }}>🏴‍☠️</span>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#38bdf8' }}>
            ĐẠI CHIẾN TÀU CƯỚP BIỂN ({maxHp} CÂU HỎI = {maxHp} ❤️)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{
            padding: '8px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: 'none',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Upload size={16} /> 📂 Tải File Excel
            <input type="file" accept=".xlsx,.xls,.doc,.docx,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={resetBattle}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: '#334155',
              border: 'none',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={16} /> Chơi Lại
          </button>
        </div>
      </div>

      {/* Ocean & Ship Arena */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 80px 40px 80px',
        transform: screenShake ? 'translate(6px, -6px)' : 'none',
        transition: 'transform 0.05s ease'
      }}>
        {/* Floating Victory Announcement Banner in Sea Arena */}
        {winner && (
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: winner === 1 ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: '24px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
            fontWeight: 900,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            border: '3px solid #ffffff',
            zIndex: 100
          }}>
            <span>🏆 TÀU {winner === 1 ? team1Name : team2Name} CHIẾN THẮNG! TÀU {winner === 1 ? team2Name : team1Name} ĐÃ BỊ ĐÁNH CHÌM!</span>
            <button
              onClick={resetBattle}
              style={{
                background: '#ffffff',
                color: winner === 1 ? '#b91c1c' : '#1d4ed8',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              🔄 Chơi Lại Trận Mới
            </button>
          </div>
        )}

        {/* Clouds & Sun */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50px',
          fontSize: '3rem',
          opacity: 0.8
        }}>
          ☁️ ☁️
        </div>
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '80px',
          fontSize: '3.5rem'
        }}>
          ☀️
        </div>

        {/* Ship 1: Player 1 (Red Flag Pirate Ship) */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 2.5s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 2.5s ease',
          transform: p1Hp === 0 ? 'rotate(70deg) translateY(260px) scale(0.5)' : 'none',
          opacity: p1Hp === 0 ? 0.3 : 1
        }}>
          {p1Hp === 0 && (
            <div style={{
              position: 'absolute',
              top: '-40px',
              fontSize: '3.5rem',
              zIndex: 20
            }}>
              💥🔥🌊
            </div>
          )}

          {/* Hearts HP Bar */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '8px 14px',
            borderRadius: '16px',
            marginBottom: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            border: '2px solid #ef4444',
            maxWidth: '320px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ef4444' }}>
                🔴 {team1Name}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: '10px' }}>
                {p1Hp}/{maxHp} ❤️
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px', marginTop: '2px' }}>
              {Array.from({ length: maxHp }).map((_, i) => (
                <Heart
                  key={i}
                  size={maxHp > 20 ? 12 : maxHp > 12 ? 14 : 16}
                  fill={i < p1Hp ? '#ef4444' : 'transparent'}
                  color={i < p1Hp ? '#ef4444' : '#64748b'}
                  style={{ transition: 'all 0.3s ease' }}
                />
              ))}
            </div>
          </div>

          {/* Ship Graphic */}
          <div style={{ fontSize: '6rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>
            ⛵🏴‍☠️
          </div>
        </div>

        {/* Cannonball Arc Particle Animation */}
        {cannonShot && (
          <div style={{
            position: 'absolute',
            left: cannonShot.shooter === 1 
              ? `calc(120px + ${cannonShot.progress * 70}%)` 
              : `calc(85% - ${cannonShot.progress * 70}%)`,
            top: `calc(50% - ${Math.sin(cannonShot.progress * Math.PI) * 160}px)`,
            width: '24px',
            height: '24px',
            background: '#0f172a',
            border: '3px solid #f59e0b',
            borderRadius: '50%',
            boxShadow: '0 0 20px #f59e0b',
            zIndex: 50
          }} />
        )}

        {/* Ship 2: Player 2 (Blue Flag Pirate Ship) */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 2.5s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 2.5s ease',
          transform: p2Hp === 0 ? 'scaleX(-1) rotate(70deg) translateY(260px) scale(0.5)' : 'scaleX(-1)',
          opacity: p2Hp === 0 ? 0.3 : 1
        }}>
          {p2Hp === 0 && (
            <div style={{
              position: 'absolute',
              top: '-40px',
              fontSize: '3.5rem',
              transform: 'scaleX(-1)',
              zIndex: 20
            }}>
              💥🔥🌊
            </div>
          )}

          {/* Hearts HP Bar (Flipped back for readability) */}
          <div style={{
            transform: 'scaleX(-1)',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '8px 14px',
            borderRadius: '16px',
            marginBottom: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            border: '2px solid #3b82f6',
            maxWidth: '320px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#3b82f6' }}>
                🔵 {team2Name}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', background: '#3b82f6', padding: '2px 8px', borderRadius: '10px' }}>
                {p2Hp}/{maxHp} ❤️
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px', marginTop: '2px' }}>
              {Array.from({ length: maxHp }).map((_, i) => (
                <Heart
                  key={i}
                  size={maxHp > 20 ? 12 : maxHp > 12 ? 14 : 16}
                  fill={i < p2Hp ? '#3b82f6' : 'transparent'}
                  color={i < p2Hp ? '#3b82f6' : '#64748b'}
                  style={{ transition: 'all 0.3s ease' }}
                />
              ))}
            </div>
          </div>

          {/* Ship Graphic */}
          <div style={{ fontSize: '6rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>
            ⛵🏴‍☠️
          </div>
        </div>

        {/* Waves effect at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '25px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)'
        }} />
      </div>

      {/* Bottom Dual Question Workspace */}
      <div style={{
        height: '220px',
        background: '#0f172a',
        borderTop: '2px solid #1e293b',
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* Left Question Box (Team 1) */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '20px',
          padding: '16px',
          border: '2px solid #ef4444',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
            🔴 {team1Name}: {p1CurrentQ.question}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {p1CurrentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleP1Answer(idx, opt)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: p1Selected === idx ? '#ef4444' : '#334155',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Right Question Box (Team 2) */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '20px',
          padding: '16px',
          border: '2px solid #3b82f6',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
            🔵 {team2Name}: {p2CurrentQ.question}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {p2CurrentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleP2Answer(idx, opt)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: p2Selected === idx ? '#3b82f6' : '#334155',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
