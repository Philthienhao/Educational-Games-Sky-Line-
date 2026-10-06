import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Trophy, RefreshCw, Volume2, Sparkles, ArrowRight, Zap, Check, X, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { parseUploadedFile } from '../../utils/universalParser';

export function MathSackRaceGame({ questions: propQuestions, game, teams, onAddPoints, onClose }) {
  const [customQuestions, setCustomQuestions] = useState(null);

  // Default Multiple-Choice Questions
  const defaultQs = [
    {
      question: 'Hệ Mặt Trời của chúng ta bao gồm bao nhiêu hành tinh quay quanh Mặt Trời?',
      options: ['8 hành tinh', '9 hành tinh', '7 hành tinh', '10 hành tinh'],
      correct: 'A'
    },
    {
      question: 'Hành tinh nào nằm ở vị trí gần Mặt Trời nhất trong Hệ Mặt Trời?',
      options: ['Sao Thủy (Mercury)', 'Sao Kim (Venus)', 'Trái Đất (Earth)', 'Sao Hỏa (Mars)'],
      correct: 'A'
    },
    {
      question: 'Từ nào sau đây viết đúng chính tả?',
      options: ['Sắp xếp', 'Xắp xếp', 'Sắp xết', 'Xắp xết'],
      correct: 'A'
    },
    {
      question: 'Sông Cửu Long chảy ra biển qua bao nhiêu cửa sông?',
      options: ['9 cửa', '7 cửa', '5 cửa', '12 cửa'],
      correct: 'A'
    },
    {
      question: '9 × 8 bằng bao nhiêu?',
      options: ['72', '64', '81', '76'],
      correct: 'A'
    },
    {
      question: 'Thủ đô của Việt Nam là thành phố nào?',
      options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'],
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
        id: q.id || `sack_q_${idx}`,
        question: qText,
        options: opts,
        correct: corr
      };
    });
  }, [activeQuestionsList]);

  const [isStarted, setIsStarted] = useState(false);
  const [winner, setWinner] = useState(null); // 1 | 2 | null

  const team1Name = teams?.[0]?.name || 'Đội 1';
  const team2Name = teams?.[1]?.name || 'Đội 2';

  // Player 1 State
  const [p1Score, setP1Score] = useState(0);
  const [p1QIndex, setP1QIndex] = useState(0);
  const [p1Selected, setP1Selected] = useState(null);
  const [p1Jump, setP1Jump] = useState(false);

  // Player 2 State
  const [p2Score, setP2Score] = useState(0);
  const [p2QIndex, setP2QIndex] = useState(1);
  const [p2Selected, setP2Selected] = useState(null);
  const [p2Jump, setP2Jump] = useState(false);

  const p1CurrentQ = safeQuestions[p1QIndex % safeQuestions.length];
  const p2CurrentQ = safeQuestions[p2QIndex % safeQuestions.length];

  const TARGET_SCORE = safeQuestions.length > 0 ? safeQuestions.length : 10;

  const handleP1Answer = (optIndex, optValue) => {
    if (winner || p1Selected !== null) return;
    setP1Selected(optIndex);

    let isRight = false;
    if (p1CurrentQ.correct === 'A' && optIndex === 0) isRight = true;
    else if (p1CurrentQ.correct === 'B' && optIndex === 1) isRight = true;
    else if (p1CurrentQ.correct === 'C' && optIndex === 2) isRight = true;
    else if (p1CurrentQ.correct === 'D' && optIndex === 3) isRight = true;
    else if (String(optValue).trim().toLowerCase() === String(p1CurrentQ.correct).trim().toLowerCase()) isRight = true;

    if (isRight) {
      SoundFX.correct();
      setP1Jump(true);
      setTimeout(() => setP1Jump(false), 400);

      const nextScore = p1Score + 1;
      setP1Score(nextScore);
      if (onAddPoints) onAddPoints(0, 10);

      if (nextScore >= TARGET_SCORE) {
        setWinner(1);
        SoundFX.fanfare();
        confetti({ particleCount: 120, spread: 90, origin: { x: 0.2, y: 0.6 } });
      }
    } else {
      SoundFX.wrong();
    }

    setTimeout(() => {
      setP1Selected(null);
      setP1QIndex(prev => prev + 2);
    }, 800);
  };

  const handleP2Answer = (optIndex, optValue) => {
    if (winner || p2Selected !== null) return;
    setP2Selected(optIndex);

    let isRight = false;
    if (p2CurrentQ.correct === 'A' && optIndex === 0) isRight = true;
    else if (p2CurrentQ.correct === 'B' && optIndex === 1) isRight = true;
    else if (p2CurrentQ.correct === 'C' && optIndex === 2) isRight = true;
    else if (p2CurrentQ.correct === 'D' && optIndex === 3) isRight = true;
    else if (String(optValue).trim().toLowerCase() === String(p2CurrentQ.correct).trim().toLowerCase()) isRight = true;

    if (isRight) {
      SoundFX.correct();
      setP2Jump(true);
      setTimeout(() => setP2Jump(false), 400);

      const nextScore = p2Score + 1;
      setP2Score(nextScore);
      if (onAddPoints) onAddPoints(1, 10);

      if (nextScore >= TARGET_SCORE) {
        setWinner(2);
        SoundFX.fanfare();
        confetti({ particleCount: 120, spread: 90, origin: { x: 0.8, y: 0.6 } });
      }
    } else {
      SoundFX.wrong();
    }

    setTimeout(() => {
      setP2Selected(null);
      setP2QIndex(prev => prev + 2);
    }, 800);
  };

  const resetGame = () => {
    setP1Score(0);
    setP2Score(0);
    setP1QIndex(0);
    setP2QIndex(1);
    setP1Selected(null);
    setP2Selected(null);
    setWinner(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed && parsed.length > 0) {
        setCustomQuestions(parsed);
        resetGame();
        alert(`Đã tải lên ${parsed.length} câu hỏi trắc nghiệm thành công!`);
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
          title="ĐUA NHẢY BAO BỐ TRẮC NGHIỆM"
          subtitle="Thi Đấu Trắc Nghiệm 2 Đội Chọn Đáp Án A, B, C, D Nhảy Bao Bố Tiến Về Đích"
          icon="🦘"
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
            ĐUA NHẢY BAO BỐ TRẮC NGHIỆM
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

      {/* Main Dual Multiple Choice Workspace */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '380px 1fr 380px',
        gap: '20px',
        padding: '20px',
        alignItems: 'center'
      }}>
        {/* Left Controller: Player 1 (Red Team) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px',
          border: '4px solid #ef4444',
          height: '100%',
          maxHeight: '560px'
        }}>
          {/* Team Header */}
          <div style={{
            background: '#ef4444',
            color: '#fff',
            borderRadius: '16px',
            padding: '10px 16px',
            fontWeight: 900,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>🔴 {team1Name}</span>
            <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 10px', borderRadius: '10px' }}>
              {p1Score} / {TARGET_SCORE} bước
            </span>
          </div>

          {/* Question Box */}
          <div style={{
            background: '#1e293b',
            color: '#fff',
            borderRadius: '18px',
            padding: '18px',
            textAlign: 'center',
            fontWeight: 800,
            fontSize: '1.15rem',
            lineHeight: 1.5,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)'
          }}>
            {p1CurrentQ.question}
          </div>

          {/* Option Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: p1CurrentQ.options.length > 2 ? '1fr 1fr' : '1fr',
            gap: '10px'
          }}>
            {p1CurrentQ.options.map((opt, idx) => {
              const isSelected = p1Selected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleP1Answer(idx, opt)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: '16px',
                    border: '2px solid #cbd5e1',
                    background: isSelected ? '#ef4444' : '#f8fafc',
                    color: isSelected ? '#fff' : '#0f172a',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Arena */}
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            marginBottom: '16px',
            letterSpacing: '1px',
            color: '#fff'
          }}>
            🦘 ĐUA NHẢY BAO BỐ TRẮC NGHIỆM
          </h2>

          {/* Race Track */}
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
                  {team1Name}
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
                  {team2Name}
                </span>
              </div>
            </div>
          </div>

          <p style={{ marginTop: '16px', fontSize: '0.95rem', opacity: 0.95, fontWeight: 700, color: '#fff' }}>
            Chọn đáp án đúng để nhảy tiến về đích! (Cần {TARGET_SCORE} bước nhảy để chiến thắng)
          </p>
        </div>

        {/* Right Panel: Team 2 (Blue Team) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px',
          border: '4px solid #3b82f6',
          maxHeight: '560px',
          height: '100%'
        }}>
          {/* Team Header */}
          <div style={{
            background: '#3b82f6',
            color: '#fff',
            borderRadius: '16px',
            padding: '10px 16px',
            fontWeight: 900,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>🔵 {team2Name}</span>
            <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 10px', borderRadius: '10px' }}>
              {p2Score} / {TARGET_SCORE} bước
            </span>
          </div>

          {/* Question Box */}
          <div style={{
            background: '#1e293b',
            color: '#fff',
            borderRadius: '18px',
            padding: '18px',
            textAlign: 'center',
            fontWeight: 800,
            fontSize: '1.15rem',
            lineHeight: 1.5,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)'
          }}>
            {p2CurrentQ.question}
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: p2CurrentQ.options.length > 2 ? '1fr 1fr' : '1fr',
            gap: '10px'
          }}>
            {p2CurrentQ.options.map((opt, idx) => {
              const isSelected = p2Selected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleP2Answer(idx, opt)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: '16px',
                    border: '2px solid #cbd5e1',
                    background: isSelected ? '#3b82f6' : '#f8fafc',
                    color: isSelected ? '#fff' : '#0f172a',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt}
                </button>
              );
            })}
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
          background: 'rgba(0,0,0,0.75)',
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
            maxWidth: '520px'
          }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>🏆</div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: winner === 1 ? '#ef4444' : '#3b82f6' }}>
              {winner === 1 ? team1Name : team2Name} CHIẾN THẮNG!
            </h2>
            <p style={{ margin: '16px 0 24px', fontSize: '1.1rem', color: '#64748b', fontWeight: 700 }}>
              Chúc mừng {winner === 1 ? team1Name : team2Name} đã xuất sắc hoàn thành {TARGET_SCORE} bước nhảy bao bố về đích đầu tiên!
            </p>
            <button
              onClick={resetGame}
              style={{
                padding: '14px 36px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 900,
                fontSize: '1.15rem',
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
