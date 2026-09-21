import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion } from '../../utils/universalParser';

export function MysteryBoxGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const [openedBoxes, setOpenedBoxes] = useState([]);
  const [activeBoxIndex, setActiveBoxIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  
  // Use activeTeamIndex if provided, or fallback to internal state
  const [localActiveTeam, setLocalActiveTeam] = useState(0);
  const currentTeamIdx = setActiveTeamIndex !== undefined ? activeTeamIndex : localActiveTeam;
  const setTurnTeam = (newIdx) => {
    if (setActiveTeamIndex) setActiveTeamIndex(newIdx);
    else setLocalActiveTeam(newIdx);
  };

  const currentTeam = teams[currentTeamIdx % teams.length] || teams[0];

  const BOX_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const BOX_ICONS = ['🎁', '📦', '✨', '⭐', '🎉', '💎', '🏆', '🎈'];
  const BOX_PRIZES = ['+100 Điểm', '+150 Điểm', '+200 Điểm', 'NHÂN ĐÔI ĐIỂM', '+300 Điểm', '+250 Điểm'];

  // Dynamically generate boxes matching ALL uploaded questions (unlimited)
  const boxesList = (questions && questions.length > 0 ? questions : Array.from({ length: 6 }));
  const boxes = boxesList.map((_, idx) => ({
    id: idx + 1,
    color: BOX_COLORS[idx % BOX_COLORS.length],
    prize: BOX_PRIZES[idx % BOX_PRIZES.length],
    icon: BOX_ICONS[idx % BOX_ICONS.length]
  }));

  const currentQ = activeBoxIndex !== null ? (questions[activeBoxIndex % questions.length] || questions[0]) : null;
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (activeBoxIndex === null || answerState) return;
    setTimeLeft(20);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAnswerState('timeout');
          setSelectedOption('TIMEOUT');
          try { SoundFX.wrong(); } catch(e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBoxIndex, answerState]);

  const handleOpenBox = (idx) => {
    if (openedBoxes.includes(idx) || answerState) return;
    setActiveBoxIndex(idx);
    setSelectedOption(null);
    setAnswerState(null);
    SoundFX.click();
  };

  const handleAnswerOption = (optLabel) => {
    if (answerState || !currentQ) return;
    setSelectedOption(optLabel);

    if (optLabel === currentQ.correct) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 80, spread: 70 });
      onAddPoints(currentTeamIdx, 150);
      setOpenedBoxes([...openedBoxes, activeBoxIndex]);
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  const handleCloseModal = () => {
    setActiveBoxIndex(null);
    setSelectedOption(null);
    setAnswerState(null);
    setTurnTeam((currentTeamIdx + 1) % teams.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
          🎁 Chọn Hộp Quà Bí Mật Để Nhận Thưởng
        </h2>

        {/* Turn Selector Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentTeam && (
            <div style={{
              padding: '6px 16px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${currentTeam.color}35 0%, rgba(15, 23, 42, 0.9) 100%)`,
              border: `2px solid ${currentTeam.color}`,
              boxShadow: `0 0 16px ${currentTeam.color}60`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1.1rem' }}>👑</span>
              <span style={{ color: currentTeam.color, fontWeight: 900, fontSize: '0.95rem' }}>
                Đang đến lượt: {currentTeam.name}
              </span>
            </div>
          )}

          <select 
            value={currentTeamIdx} 
            onChange={(e) => setTurnTeam(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: '10px', background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, cursor: 'pointer' }}
          >
            {teams.map((t, idx) => (
              <option key={idx} value={idx}>{t.name} ({t.score}đ)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gift Boxes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', width: '100%' }}>
        {boxes.map((box, idx) => {
          const isOpened = openedBoxes.includes(idx);
          return (
            <div
              key={box.id}
              onClick={() => handleOpenBox(idx)}
              style={{
                height: '180px',
                borderRadius: '24px',
                background: isOpened ? 'rgba(255,255,255,0.05)' : box.color,
                border: isOpened ? '2px dashed rgba(255,255,255,0.2)' : '2px solid rgba(255,255,255,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isOpened ? 'default' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isOpened ? 'none' : '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative',
                opacity: isOpened ? 0.4 : 1
              }}
              className={!isOpened ? 'animate-pulse-glow' : ''}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>
                {isOpened ? '🔓' : box.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                {isOpened ? 'ĐÃ MỞ' : `HỘP QUÀ #0${box.id}`}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                {isOpened ? box.prize : 'Bấm để giải đố'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Question Modal */}
      {activeBoxIndex !== null && currentQ && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '920px', padding: '36px', borderRadius: '28px', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span className="badge badge-accent" style={{ fontSize: '1rem', padding: '8px 18px', borderRadius: '14px', fontWeight: 900 }}>
                🎁 THỬ THÁCH HỘP QUÀ #{activeBoxIndex + 1}
              </span>
              <span style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                Dành cho: <strong style={{ color: currentTeam?.color || '#fff', fontSize: '1.2rem' }}>{currentTeam?.name || 'Đội chơi'}</strong>
              </span>
            </div>

            {currentQ.image && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img 
                  src={currentQ.image} 
                  alt="Câu hỏi" 
                  style={{ maxHeight: '260px', maxWidth: '100%', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)', objectFit: 'contain' }} 
                />
              </div>
            )}

            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: '28px', lineHeight: 1.45, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {currentQ.question}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
                if (!isOptionValidForQuestion(currentQ?.options, idx)) return null;
                const optText = currentQ.options[idx];
                const isSelected = selectedOption === optLabel;
                const isCorrect = currentQ.correct === optLabel;

                let bg = '#ffffff';
                let border = '2.5px solid #cbd5e1';
                let textColor = '#0f172a';
                let badgeBg = '#2563eb';

                if (answerState) {
                  if (isCorrect) {
                    bg = '#dcfce7';
                    border = '2.5px solid #16a34a';
                    textColor = '#14532d';
                    badgeBg = '#16a34a';
                  } else if (isSelected && !isCorrect) {
                    bg = '#fee2e2';
                    border = '2.5px solid #dc2626';
                    textColor = '#7f1d1d';
                    badgeBg = '#dc2626';
                  }
                }

                return (
                  <button
                    key={optLabel}
                    onClick={() => handleAnswerOption(optLabel)}
                    disabled={!!answerState}
                    style={{
                      padding: '20px 24px',
                      borderRadius: '20px',
                      background: bg,
                      border: border,
                      color: textColor,
                      textAlign: 'left',
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      lineHeight: 1.4,
                      cursor: answerState ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '38px',
                      height: '38px',
                      minWidth: '38px',
                      borderRadius: '12px',
                      background: badgeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {optLabel}
                    </span>
                    <span style={{ flex: 1, color: textColor, fontWeight: 900 }}>{optText}</span>
                  </button>
                );
              })}
            </div>

            {answerState && (
              <div style={{ padding: '16px', borderRadius: '14px', background: answerState === 'correct' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 800, color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5' }}>
                  {answerState === 'correct' ? `🎉 CHÍNH XÁC! BẠN MỞ ĐƯỢC HỘP QUÀ +150 ĐIỂM!` : `❌ CHƯA CHÍNH XÁC!`}
                </div>
                <button className="btn btn-primary" onClick={handleCloseModal}>
                  Đóng Hộp Quà
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
