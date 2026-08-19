import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

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
          <div className="glass-modal" style={{ width: '100%', maxWidth: '700px', padding: '32px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span className="badge badge-accent" style={{ fontSize: '0.85rem' }}>
                🎁 THỬ THÁCH HỘP QUÀ #{activeBoxIndex + 1}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Dành cho: <strong style={{ color: currentTeam?.color || '#fff' }}>{currentTeam?.name || 'Đội chơi'}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '24px', lineHeight: 1.4 }}>
              {currentQ.question}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
                const optText = currentQ.options[idx];
                const isSelected = selectedOption === optLabel;
                const isCorrect = currentQ.correct === optLabel;

                let bg = 'rgba(255,255,255,0.06)';
                let border = '1px solid rgba(255,255,255,0.15)';

                if (answerState) {
                  if (isCorrect) {
                    bg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    border = '1px solid #6ee7b7';
                  } else if (isSelected && !isCorrect) {
                    bg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                    border = '1px solid #fca5a5';
                  }
                }

                return (
                  <button
                    key={optLabel}
                    onClick={() => handleAnswerOption(optLabel)}
                    disabled={!!answerState}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: bg,
                      border: border,
                      color: '#fff',
                      textAlign: 'left',
                      fontWeight: 700,
                      cursor: answerState ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      {optLabel}
                    </span>
                    {optText}
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
