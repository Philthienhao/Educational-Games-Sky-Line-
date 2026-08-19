import React, { useState } from 'react';
import { Flag, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

export function CarRaceGame({ questions, teams, onAddPoints }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [carPositions, setCarPositions] = useState(teams.map(() => 0)); // 0 to 100%
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState(null);

  const carIcons = ['🏎️', '🚘', '🏎️', '🚕', '🚗', '🏎️', '🚙', '🚓'];
  const currentQ = questions[currentQIndex] || questions[0];

  const handleAnswer = (optLabel) => {
    if (answerState || winnerTeam) return;
    setSelectedOption(optLabel);

    const isCorrect = optLabel === currentQ.correct;

    if (isCorrect) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 70, spread: 60 });
      onAddPoints(activeTeamIndex, 100);

      // Advance active team's car by 25%
      const newPositions = [...carPositions];
      newPositions[activeTeamIndex] = Math.min(100, (newPositions[activeTeamIndex] || 0) + 25);
      setCarPositions(newPositions);

      if (newPositions[activeTeamIndex] >= 100) {
        setWinnerTeam(teams[activeTeamIndex]?.name || `Đội ${activeTeamIndex + 1}`);
        SoundFX.fanfare();
        confetti({ particleCount: 120, spread: 90 });
      }
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  const handleNextTurn = () => {
    setSelectedOption(null);
    setAnswerState(null);
    setActiveTeamIndex(prev => (prev + 1) % teams.length);
    setCurrentQIndex(prev => (prev + 1) % questions.length);
  };

  const handleResetRace = () => {
    setCarPositions(teams.map(() => 0));
    setWinnerTeam(null);
    setSelectedOption(null);
    setAnswerState(null);
    setCurrentQIndex(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 20px', width: '100%', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🏎️ Đua Xe Kiến Thức - Cuộc Đua Tốc Độ
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Trả lời đúng để tăng tốc xe đua về đích đầu tiên!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleResetRace}>
            <RotateCcw size={16} /> Đặt Lại Đường Đua
          </button>
        </div>
      </div>

      {/* Race Track Arena */}
      <div className="glass-panel" style={{
        width: '100%',
        padding: '20px 24px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        border: '2px solid rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        
        {/* Race Finish Line Flag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
          <span>🚦 XUẤT PHÁT (0%)</span>
          <span>🏁 ĐÍCH ĐẾN (100%)</span>
        </div>

        {/* Dynamic Car Lanes */}
        {teams.map((team, idx) => {
          const pos = carPositions[idx] || 0;
          const isWinner = winnerTeam === team.name;

          return (
            <div 
              key={team.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '16px',
                background: activeTeamIndex === idx ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: activeTeamIndex === idx ? `1.5px solid ${team.color}` : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {/* Team Label */}
              <div style={{ width: '130px', fontWeight: 800, color: team.color, fontSize: '0.85rem', flexShrink: 0 }}>
                {team.name}
              </div>

              {/* Lane Track */}
              <div style={{
                flex: 1,
                height: '42px',
                borderRadius: '21px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px dashed rgba(255,255,255,0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px'
              }}>
                {/* Finish Line Pattern */}
                <div style={{ position: 'absolute', right: '10px', fontSize: '1.2rem', opacity: 0.8 }}>
                  🏁
                </div>

                {/* Animated Racing Car */}
                <div style={{
                  position: 'absolute',
                  left: `calc(${pos}% * 0.85 + 8px)`,
                  transition: 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontSize: '1.8rem',
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {carIcons[idx % carIcons.length]}
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, background: team.color, color: '#fff', padding: '2px 6px', borderRadius: '10px' }}>
                    {pos}%
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Winner Announcement or Question Box */}
      {winnerTeam ? (
        <div className="glass-panel" style={{ width: '100%', padding: '36px', textAlign: 'center' }}>
          <Trophy size={60} color="#f59e0b" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24' }}>
            🎉 CHIẾN THẮNG RỰC RỠ THUỘC VỀ {winnerTeam.toUpperCase()}!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
            Đội đã xuất sắc vươn lên dẫn đầu và cán đích 100% trong cuộc đua tốc độ!
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleResetRace}>
            Bắt Đầu Cuộc Đua Mới
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ width: '100%', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="badge badge-teacher">
              CÂU HỎI {currentQIndex + 1} / {questions.length}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Đến lượt xe đua của: <strong style={{ color: teams[activeTeamIndex]?.color || '#fff' }}>{teams[activeTeamIndex]?.name}</strong>
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>
            {currentQ.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
              const optText = currentQ.options[idx];
              const isSelected = selectedOption === optLabel;
              const isCorrect = currentQ.correct === optLabel;

              let bg = 'rgba(255,255,255,0.06)';
              let border = '1px solid rgba(255,255,255,0.12)';

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
                  onClick={() => handleAnswer(optLabel)}
                  disabled={!!answerState}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: answerState === 'correct' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
              <div style={{ fontWeight: 800, color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5' }}>
                {answerState === 'correct' ? `🎉 ${teams[activeTeamIndex]?.name} TRẢ LỜI ĐÚNG! XE VƯỢT TỐC THÊM +25%!` : `❌ CHƯA CHÍNH XÁC!`}
              </div>
              <button className="btn btn-primary" onClick={handleNextTurn}>
                Lượt Đua Tiếp Theo 🏎️
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
