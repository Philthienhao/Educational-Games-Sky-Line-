import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Trophy, RefreshCw, Volume2, Sparkles, ArrowRight, Zap, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { parseUploadedFile } from '../../utils/universalParser';

export function MathSackRaceGame({ questions: propQuestions, teams, onAddPoints, onClose }) {
  const [customQuestions, setCustomQuestions] = useState(null);

  // Default Math Questions palette
  const defaultQs = [
    { question: '9 × 8 = ?', answer: 72 },
    { question: '5 × 8 = ?', answer: 40 },
    { question: '7 × 6 = ?', answer: 42 },
    { question: '9 × 9 = ?', answer: 81 },
    { question: '8 × 4 = ?', answer: 32 },
    { question: '6 × 8 = ?', answer: 48 },
    { question: '7 × 9 = ?', answer: 63 },
    { question: '12 × 5 = ?', answer: 60 },
    { question: '15 × 4 = ?', answer: 60 },
    { question: '14 + 28 = ?', answer: 42 },
    { question: '100 - 37 = ?', answer: 63 },
    { question: '45 ÷ 5 = ?', answer: 9 }
  ];

  const safeQuestions = useMemo(() => {
    if (customQuestions && customQuestions.length > 0) return customQuestions;
    if (Array.isArray(propQuestions) && propQuestions.length > 0) {
      return propQuestions.map((q, idx) => {
        let ansText = q.correctAnswer || (q.options ? q.options[0] : '10');
        let numAns = parseInt(ansText, 10);
        if (isNaN(numAns)) numAns = 10;
        return {
          question: q.question || `Câu ${idx + 1}`,
          answer: numAns
        };
      });
    }
    return defaultQs;
  }, [propQuestions, customQuestions]);

  const [isStarted, setIsStarted] = useState(false);
  const [winner, setWinner] = useState(null); // 1 | 2 | null

  // Player 1 State
  const [p1Score, setP1Score] = useState(0);
  const [p1QIndex, setP1QIndex] = useState(0);
  const [p1Input, setP1Input] = useState('');
  const [p1Jump, setP1Jump] = useState(false);

  // Player 2 State
  const [p2Score, setP2Score] = useState(0);
  const [p2QIndex, setP2QIndex] = useState(1);
  const [p2Input, setP2Input] = useState('');
  const [p2Jump, setP2Jump] = useState(false);

  const p1CurrentQ = safeQuestions[p1QIndex % safeQuestions.length];
  const p2CurrentQ = safeQuestions[p2QIndex % safeQuestions.length];

  const TARGET_SCORE = 10; // 10 jumps to finish line

  const handleP1Numpad = (val) => {
    if (winner) return;
    SoundFX.click();
    if (val === 'C') {
      setP1Input('');
    } else if (val === 'Go') {
      submitP1();
    } else {
      if (p1Input.length < 5) setP1Input(prev => prev + val);
    }
  };

  const submitP1 = () => {
    if (!p1Input) return;
    const userVal = parseInt(p1Input, 10);
    if (userVal === p1CurrentQ.answer) {
      SoundFX.correct();
      setP1Jump(true);
      setTimeout(() => setP1Jump(false), 400);

      const nextScore = p1Score + 1;
      setP1Score(nextScore);
      setP1Input('');
      setP1QIndex(prev => prev + 2);
      if (onAddPoints) onAddPoints(0, 10);

      if (nextScore >= TARGET_SCORE) {
        setWinner(1);
        SoundFX.fanfare();
        confetti({ particleCount: 100, spread: 80, origin: { x: 0.2, y: 0.6 } });
      }
    } else {
      SoundFX.wrong();
      setP1Input('');
    }
  };

  const handleP2Numpad = (val) => {
    if (winner) return;
    SoundFX.click();
    if (val === 'C') {
      setP2Input('');
    } else if (val === 'Go') {
      submitP2();
    } else {
      if (p2Input.length < 5) setP2Input(prev => prev + val);
    }
  };

  const submitP2 = () => {
    if (!p2Input) return;
    const userVal = parseInt(p2Input, 10);
    if (userVal === p2CurrentQ.answer) {
      SoundFX.correct();
      setP2Jump(true);
      setTimeout(() => setP2Jump(false), 400);

      const nextScore = p2Score + 1;
      setP2Score(nextScore);
      setP2Input('');
      setP2QIndex(prev => prev + 2);
      if (onAddPoints) onAddPoints(1, 10);

      if (nextScore >= TARGET_SCORE) {
        setWinner(2);
        SoundFX.fanfare();
        confetti({ particleCount: 100, spread: 80, origin: { x: 0.8, y: 0.6 } });
      }
    } else {
      SoundFX.wrong();
      setP2Input('');
    }
  };

  const resetGame = () => {
    setP1Score(0);
    setP2Score(0);
    setP1QIndex(0);
    setP2QIndex(1);
    setP1Input('');
    setP2Input('');
    setWinner(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed && parsed.length > 0) {
        const mathQs = parsed.map(q => ({
          question: q.question || 'Câu hỏi',
          answer: parseInt(q.correctAnswer || q.options?.[0] || '0', 10)
        }));
        setCustomQuestions(mathQs);
        resetGame();
        alert(`Đã tải lên ${mathQs.length} câu toán thành công!`);
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
      background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #0f172a 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {!isStarted && (
        <StartGameOverlay
          title="ĐUA NHẢY BAO BỐ TOÁN HỌC"
          subtitle="Thi Đấu Bàn Phím Số Numpad 2 Người Chơi Trực Tiếp Trên Bảng Tương Tác"
          icon="🏃‍♂️"
          gradient="linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
          onStart={() => setIsStarted(true)}
          onUpload={handleFileUpload}
        />
      )}

      {/* Header Bar */}
      <div style={{
        padding: '12px 24px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost" style={{ color: '#fff' }}>
            ✕
          </button>
          <span style={{ fontSize: '1.4rem' }}>🦘</span>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#38bdf8', letterSpacing: '-0.5px' }}>
            ĐUA NHẢY BAO BỐ TOÁN HỌC
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={resetGame}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
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

      {/* Main Dual Numpad & Arena Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '280px 1fr 280px',
        gap: '20px',
        padding: '20px',
        alignItems: 'center'
      }}>
        {/* Left Controller: Player 1 (Red) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '18px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '4px solid #ef4444'
        }}>
          {/* Question Box */}
          <div style={{
            background: '#4c1d95',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: '1.4rem'
          }}>
            {p1CurrentQ.question}
          </div>

          {/* LCD Screen Display */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #cbd5e1',
            borderRadius: '14px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#ef4444',
            letterSpacing: '2px'
          }}>
            {p1Input || '_'}
          </div>

          {/* 3x4 Numpad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'Go'].map((val) => (
              <button
                key={val}
                onClick={() => handleP1Numpad(val)}
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  border: 'none',
                  background: val === 'C' ? '#ef4444' : val === 'Go' ? '#3b82f6' : '#f1f5f9',
                  color: (val === 'C' || val === 'Go') ? '#fff' : '#0f172a',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
                  transition: 'transform 0.1s active'
                }}
              >
                {val}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontWeight: 900, color: '#ef4444', fontSize: '0.95rem' }}>
            🔴 Đội 1: {p1Score} / {TARGET_SCORE} bước
          </div>
        </div>

        {/* Center Race Track Arena */}
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            marginBottom: '16px',
            letterSpacing: '1px'
          }}>
            BALAP KARUNG MATEMATIKA
          </h2>

          {/* Race Track Canvas Container */}
          <div style={{
            width: '100%',
            height: '240px',
            background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
            borderRadius: '30px',
            border: '6px solid #ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: '20px 40px'
          }}>
            {/* Start Line */}
            <div style={{
              position: 'absolute',
              left: '60px',
              top: 0,
              bottom: 0,
              width: '8px',
              background: '#ffffff',
              zIndex: 1
            }} />

            {/* Finish Line Checkered Grid */}
            <div style={{
              position: 'absolute',
              right: '40px',
              top: 0,
              bottom: 0,
              width: '24px',
              background: 'repeating-linear-gradient(0deg, #000, #000 12px, #fff 12px, #fff 24px)',
              zIndex: 1
            }} />

            {/* Track 1: Player 1 (Red Sack) */}
            <div style={{ position: 'relative', width: '100%', height: '60px' }}>
              <div style={{
                position: 'absolute',
                left: `calc(60px + ${(p1Score / TARGET_SCORE) * 75}%)`,
                top: p1Jump ? '-20px' : '0px',
                transition: p1Jump ? 'top 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)' : 'left 0.4s ease, top 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 5
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>🦘</span>🔴
                </div>
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  marginTop: '-6px'
                }}>
                  Đội 1
                </span>
              </div>
            </div>

            {/* Track Line Separator */}
            <div style={{ borderTop: '2px dashed rgba(255,255,255,0.4)', width: '100%' }} />

            {/* Track 2: Player 2 (Blue Sack) */}
            <div style={{ position: 'relative', width: '100%', height: '60px' }}>
              <div style={{
                position: 'absolute',
                left: `calc(60px + ${(p2Score / TARGET_SCORE) * 75}%)`,
                top: p2Jump ? '-20px' : '0px',
                transition: p2Jump ? 'top 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)' : 'left 0.4s ease, top 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 5
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>🦘</span>🔵
                </div>
                <span style={{
                  background: '#3b82f6',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  marginTop: '-6px'
                }}>
                  Đội 2
                </span>
              </div>
            </div>
          </div>

          <p style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.9, fontWeight: 700 }}>
            Nhập kết quả đúng để nhảy tiến về đích! (Cần {TARGET_SCORE} bước để chiến thắng)
          </p>
        </div>

        {/* Right Controller: Player 2 (Blue) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '18px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '4px solid #3b82f6'
        }}>
          {/* Question Box */}
          <div style={{
            background: '#b91c1c',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: '1.4rem'
          }}>
            {p2CurrentQ.question}
          </div>

          {/* LCD Screen Display */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #cbd5e1',
            borderRadius: '14px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#3b82f6',
            letterSpacing: '2px'
          }}>
            {p2Input || '_'}
          </div>

          {/* 3x4 Numpad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'Go'].map((val) => (
              <button
                key={val}
                onClick={() => handleP2Numpad(val)}
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  border: 'none',
                  background: val === 'C' ? '#ef4444' : val === 'Go' ? '#3b82f6' : '#f1f5f9',
                  color: (val === 'C' || val === 'Go') ? '#fff' : '#0f172a',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
                  transition: 'transform 0.1s active'
                }}
              >
                {val}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontWeight: 900, color: '#3b82f6', fontSize: '0.95rem' }}>
            🔵 Đội 2: {p2Score} / {TARGET_SCORE} bước
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      {winner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '30px',
            padding: '40px 60px',
            textAlign: 'center',
            color: '#0f172a',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🏆</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: winner === 1 ? '#ef4444' : '#3b82f6' }}>
              ĐỘI {winner} CHIẾN THẮNG!
            </h2>
            <p style={{ margin: '16px 0 24px', fontSize: '1.1rem', color: '#64748b', fontWeight: 700 }}>
              Chúc mừng Đội {winner} đã xuất sắc hoàn thành {TARGET_SCORE} bước nhảy về đích đầu tiên!
            </p>
            <button
              onClick={resetGame}
              style={{
                padding: '14px 32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(16,185,129,0.3)'
              }}
            >
              🔄 Chơi Lại Trận Mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
