import React, { useState, useEffect } from 'react';
import { Swords, CheckCircle2, XCircle, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { isOptionValidForQuestion } from '../../utils/universalParser';

export function TugOfWarGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [ropePosition, setRopePosition] = useState(0); // -100 (Red win) to +100 (Blue win)
  const [currentTurnTeam, setCurrentTurnTeam] = useState(0); // 0 = Team A, 1 = Team B
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [winner, setWinner] = useState(null);

  const team0 = (teams && teams[0]) || { name: 'Đội Đỏ', score: 0 };
  const team1 = (teams && teams[1]) || { name: 'Đội Xanh', score: 0 };
  const currentTeam = currentTurnTeam === 0 ? team0 : team1;

  const currentQ = questions[currentQIndex] || questions[0];
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (!isGameStarted || answerState || winner) return;
    setTimeLeft(20);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAnswerState('timeout');
          setSelectedOption('TIMEOUT');
          try { SoundFX.wrong(); } catch(e) {}
          // Push rope away
          const pushAmount = currentTurnTeam === 0 ? 15 : -15;
          setRopePosition(pos => Math.max(-100, Math.min(100, pos + pushAmount)));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameStarted, currentQIndex, currentTurnTeam, answerState, winner]);

  const handleAnswer = (optLabel) => {
    if (answerState || winner) return;
    setSelectedOption(optLabel);

    const isCorrect = optLabel === currentQ.correct;

    if (isCorrect) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 70, spread: 60 });
      if (onAddPoints) onAddPoints(currentTurnTeam === 0 ? 0 : (teams && teams[1] ? 1 : 0), 100);

      // Pull rope towards active team
      const pullAmount = currentTurnTeam === 0 ? -25 : 25;
      const newPos = ropePosition + pullAmount;
      setRopePosition(newPos);

      if (newPos <= -100) {
        setWinner(team0.name);
        SoundFX.fanfare();
      } else if (newPos >= 100) {
        setWinner(team1.name);
        SoundFX.fanfare();
      }
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
      // Push rope away
      const pushAmount = currentTurnTeam === 0 ? 15 : -15;
      setRopePosition(prev => Math.max(-100, Math.min(100, prev + pushAmount)));
    }
  };

  const handleNextTurn = () => {
    setSelectedOption(null);
    setAnswerState(null);
    const nextIdx = currentTurnTeam === 0 ? 1 : 0;
    setCurrentTurnTeam(nextIdx);
    if (setActiveTeamIndex) setActiveTeamIndex(nextIdx);
    setCurrentQIndex(prev => (prev + 1) % questions.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Tug of War Arena Banner */}
      <div style={{
        width: '100%',
        padding: '24px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Teams Scoreboard & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
              🔴
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fca5a5' }}>
                {team0.name}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
                Điểm: {team0.score || 0}đ
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              ĐẾN LƯỢT: <strong style={{ color: currentTurnTeam === 0 ? '#ef4444' : '#3b82f6' }}>{currentTeam.name}</strong>
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setCurrentTurnTeam(0)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: currentTurnTeam === 0 ? '#ef4444' : 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔴 {team0.name}
              </button>
              <button 
                onClick={() => setCurrentTurnTeam(1)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: currentTurnTeam === 1 ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔵 {team1.name}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#93c5fd' }}>
                {team1.name}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
                Điểm: {team1.score || 0}đ
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
              🔵
            </div>
          </div>
        </div>

        {/* Interactive Animated Rope Tug Bar */}
        <div style={{ position: 'relative', width: '100%', height: '50px', background: 'rgba(0,0,0,0.4)', borderRadius: '25px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center' }}>
          
          {/* Middle Marker */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px', background: '#fbbf24', zIndex: 2 }} />

          {/* Rope Cable */}
          <div style={{ position: 'absolute', left: '5%', right: '5%', height: '8px', background: '#d97706', borderRadius: '4px' }} />

          {/* Tug Knot (Moves based on ropePosition: -100% to +100%) */}
          <div style={{
            position: 'absolute',
            left: `calc(50% + ${ropePosition * 0.4}%)`,
            transform: 'translateX(-50%)',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 3
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f59e0b',
              border: '3px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 0 20px #f59e0b'
            }}>
              🪢
            </div>
          </div>

          {/* Red Team Pullers */}
          <div style={{ position: 'absolute', left: '10px', fontSize: '1.8rem' }}>
            🏃‍♂️🔴
          </div>

          {/* Blue Team Pullers */}
          <div style={{ position: 'absolute', right: '10px', fontSize: '1.8rem' }}>
            🔵🏃‍♀️
          </div>
        </div>

      </div>

      {/* Winner Announcement */}
      {winner ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
          <Trophy size={60} color="#f59e0b" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24' }}>
            🎉 CHIẾN THẮNG THUỘC VỀ {winner.toUpperCase()}!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
            Đội đã xuất sắc kéo hết dây kéo co về phía sân nhà!
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => {
              setRopePosition(0);
              setWinner(null);
              setCurrentQIndex(0);
            }}
          >
            Chơi Ván Mới
          </button>
        </div>
      ) : !isGameStarted ? (
        <StartGameOverlay
          title="Kéo Co Tri Thức"
          icon="⚔️"
          onStart={() => setIsGameStarted(true)}
        />
      ) : (
        /* Question Card */
        <div className="glass-panel" style={{ width: '100%', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="badge badge-teacher">
              CÂU HỎI {currentQIndex + 1} / {questions.length}
            </span>

            {!answerState && (
              <span style={{
                background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(2, 132, 199, 0.25)',
                border: `1.5px solid ${timeLeft <= 5 ? '#ef4444' : '#38bdf8'}`,
                color: timeLeft <= 5 ? '#fca5a5' : '#7dd3fc',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '4px 12px',
                borderRadius: '10px'
              }}>
                ⏱️ {timeLeft}s
              </span>
            )}

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Đến lượt: <strong style={{ color: '#fff' }}>{currentTeam.name}</strong>
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>
            {currentQ.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
              if (!isOptionValidForQuestion(currentQ?.options, idx)) return null;
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
                {answerState === 'correct' ? `🎉 ${currentTeam.name} TRẢ LỜI ĐÚNG! KÉO DÂY VỀ PHÍA MÌNH!` : `❌ CHƯA ĐÚNG! Dây bị đẩy về phía đối thủ.`}
              </div>
              <button className="btn btn-primary" onClick={handleNextTurn}>
                Lượt Tiếp Theo
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
