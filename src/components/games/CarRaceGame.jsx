import React, { useState, useEffect } from 'react';
import { Flag, Trophy, RotateCcw, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { isOptionValidForQuestion } from '../../utils/universalParser';

export function CarRaceGame({ questions = [], teams = [], onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  // Correct answers count per team
  const [teamCorrectCounts, setTeamCorrectCounts] = useState(teams.map(() => 0));
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [winReason, setWinReason] = useState('');
  const [totalAnsweredCount, setTotalAnsweredCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(20);

  const carIcons = ['🏎️', '🚘', '🏎️', '🚕', '🚗', '🏎️', '🚙', '🚓'];
  const totalQuestions = questions.length || 10;
  // Dynamic percentage per correct question (e.g. 10 questions = 10% per correct answer)
  const percentPerCorrect = Math.round((100 / totalQuestions) * 10) / 10;

  const currentQ = questions[currentQIndex] || questions[0];

  // Timer per question
  useEffect(() => {
    if (!isGameStarted || answerState || winnerTeam) return;
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
  }, [isGameStarted, currentQIndex, activeTeamIndex, answerState, winnerTeam]);

  // Handle Answer Click
  const handleAnswer = (optLabel) => {
    if (answerState || winnerTeam) return;
    setSelectedOption(optLabel);

    const isCorrect = optLabel === currentQ.correct;

    if (isCorrect) {
      setAnswerState('correct');
      try { SoundFX.correct(); } catch(e) {}
      confetti({ particleCount: 70, spread: 60 });
      onAddPoints(activeTeamIndex, 100);

      // Increment team's correct answer count
      const updatedCounts = [...teamCorrectCounts];
      updatedCounts[activeTeamIndex] = (updatedCounts[activeTeamIndex] || 0) + 1;
      setTeamCorrectCounts(updatedCounts);

      // Calculate new progress percentage
      const teamPercent = Math.min(100, Math.round((updatedCounts[activeTeamIndex] / totalQuestions) * 100));

      // Early victory if team reaches 100% before all questions end
      if (teamPercent >= 100) {
        const winner = teams[activeTeamIndex];
        setWinnerTeam(winner);
        setWinReason(`Đã xuất sắc trả lời đúng ${updatedCounts[activeTeamIndex]}/${totalQuestions} câu và cán đích 100% sớm nhất!`);
        try { SoundFX.fanfare(); } catch(e) {}
        confetti({ particleCount: 160, spread: 100 });
      }
    } else {
      setAnswerState('wrong');
      try { SoundFX.wrong(); } catch(e) {}
    }
  };

  // Next Turn or End of Quiz Victory Evaluation
  const handleNextTurn = () => {
    setSelectedOption(null);
    setAnswerState(null);

    const nextAnswered = totalAnsweredCount + 1;
    setTotalAnsweredCount(nextAnswered);

    // Evaluate victory when ALL questions have been played
    if (nextAnswered >= totalQuestions) {
      evaluateFinalWinner();
      return;
    }

    setActiveTeamIndex(prev => (prev + 1) % teams.length);
    setCurrentQIndex(prev => (prev + 1) % totalQuestions);
  };

  // Determine Leading Team Win after all N questions are completed
  const evaluateFinalWinner = () => {
    // Compute positions for all teams
    const teamStats = teams.map((team, idx) => {
      const correctCount = teamCorrectCounts[idx] || 0;
      const percent = Math.min(100, Math.round((correctCount / totalQuestions) * 100));
      return {
        index: idx,
        team,
        correctCount,
        percent,
        score: team.score || 0
      };
    });

    // Sort by percentage desc, then by score desc
    teamStats.sort((a, b) => b.percent - a.percent || b.score - a.score);
    const topStat = teamStats[0];

    setWinnerTeam(topStat.team);
    setWinReason(`Sau tất cả ${totalQuestions} câu hỏi, ${topStat.team.name} đang dẫn đầu cuộc đua với ${topStat.percent}% đường đua (${topStat.correctCount}/${totalQuestions} câu đúng)!`);
    try { SoundFX.fanfare(); } catch(e) {}
    confetti({ particleCount: 180, spread: 110 });
  };

  // Reset Race
  const handleResetRace = () => {
    setTeamCorrectCounts(teams.map(() => 0));
    setWinnerTeam(null);
    setWinReason('');
    setSelectedOption(null);
    setAnswerState(null);
    setCurrentQIndex(0);
    setTotalAnsweredCount(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '10px 16px', width: '100%', maxWidth: '1240px', margin: '0 auto', fontFamily: 'Montserrat, system-ui, sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏎️ Đua Xe Kiến Thức ({totalQuestions} Câu — {percentPerCorrect}%/Câu Đúng)
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleResetRace}
            style={{
              padding: '6px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={15} /> Đặt Lại Cuộc Đua
          </button>
        </div>
      </div>

      {/* Sleek Compact Race Track Arena */}
      <div style={{
        width: '100%',
        padding: '10px 16px',
        borderRadius: '18px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        
        {/* Race Finish Line Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
          <span>🚦 XUẤT PHÁT (0%)</span>
          <span style={{ color: '#38bdf8' }}>🎯 TIẾN TRÌNH: {totalAnsweredCount}/{totalQuestions} CÂU HỎI</span>
          <span>🏁 ĐÍCH ĐẾN (100%)</span>
        </div>

        {/* Dynamic Compact Car Lanes */}
        {teams.map((team, idx) => {
          const correctCount = teamCorrectCounts[idx] || 0;
          const posPercent = Math.min(100, Math.round((correctCount / totalQuestions) * 100));

          return (
            <div 
              key={team.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: activeTeamIndex === idx ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: activeTeamIndex === idx ? `1.5px solid ${team.color}` : '1px solid rgba(255,255,255,0.06)'
              }}
            >
              {/* Team Label & Score */}
              <div style={{ width: '130px', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, color: team.color, fontSize: '0.85rem', lineHeight: 1.2 }}>
                  {team.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 800 }}>
                  Đúng {correctCount}/{totalQuestions} ({posPercent}%)
                </div>
              </div>

              {/* Compact Lane Track */}
              <div style={{
                flex: 1,
                height: '32px',
                borderRadius: '16px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '0 6px',
                overflow: 'hidden'
              }}>
                {/* Finish Line Pattern */}
                <div style={{ position: 'absolute', right: '8px', fontSize: '1rem', opacity: 0.9, zIndex: 2 }}>
                  🏁
                </div>

                {/* Animated Racing Car moving smoothly based on exact % */}
                <div style={{
                  position: 'absolute',
                  left: `calc(${posPercent}% * 0.83 + 4px)`,
                  transition: 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontSize: '1.4rem',
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 5
                }}>
                  {carIcons[idx % carIcons.length]}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    background: team.color,
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap'
                  }}>
                    {posPercent}%
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Winner Announcement or DOMINANT Question Box */}
      {winnerTeam ? (
        <div style={{
          width: '100%',
          padding: '36px 40px',
          borderRadius: '28px',
          background: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>
            🏆
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb', margin: 0 }}>
            🎉 CHIẾN THẮNG RỰC RỠ THUỘC VỀ {winnerTeam.name.toUpperCase()}!
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 16px 0', maxWidth: '650px', lineHeight: 1.5 }}>
            {winReason}
          </p>

          {/* Final Standings Table */}
          <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {teams.map((t, idx) => {
              const count = teamCorrectCounts[idx] || 0;
              const pct = Math.min(100, Math.round((count / totalQuestions) * 100));
              const isWinner = winnerTeam.name === t.name;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderRadius: '14px',
                    background: isWinner ? 'rgba(37, 99, 235, 0.1)' : '#f8fafc',
                    border: isWinner ? '2px solid #2563eb' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontWeight: 900, color: t.color, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isWinner && '👑'} {t.name}
                  </div>
                  <div style={{ fontWeight: 800, color: '#334155', fontSize: '0.9rem' }}>
                    Đúng {count}/{totalQuestions} câu ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleResetRace}
            style={{
              padding: '14px 32px',
              borderRadius: '16px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 900,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)'
            }}
          >
            🏎️ Bắt Đầu Cuộc Đua Mới
          </button>
        </div>
      ) : !isGameStarted ? (
        <StartGameOverlay
          title="Đua Xe Siêu Tốc"
          icon="🏎️"
          onStart={() => setIsGameStarted(true)}
        />
      ) : (
        <div style={{
          width: '100%',
          padding: '28px 32px',
          borderRadius: '26px',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Question Box Top Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ background: '#0284c7', color: '#fff', padding: '6px 16px', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              CÂU HỎI {currentQIndex + 1} / {totalQuestions}
            </span>

            {!answerState && (
              <span style={{
                background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(2, 132, 199, 0.3)',
                border: `2px solid ${timeLeft <= 5 ? '#ef4444' : '#38bdf8'}`,
                color: timeLeft <= 5 ? '#fca5a5' : '#7dd3fc',
                fontWeight: 900,
                fontSize: '1rem',
                padding: '6px 16px',
                borderRadius: '12px'
              }}>
                ⏱️ {timeLeft}s
              </span>
            )}

            <span style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 800 }}>
              Đến lượt xe đua của: <strong style={{ color: teams[activeTeamIndex]?.color || '#fff', fontSize: '1.2rem', marginLeft: '4px' }}>{teams[activeTeamIndex]?.name}</strong>
            </span>
          </div>

          {/* Prominent Question Text */}
          <h3 style={{ 
            fontSize: '1.85rem', 
            fontWeight: 900, 
            color: '#ffffff', 
            margin: '8px 0 16px 0', 
            lineHeight: 1.45,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }}>
            {currentQ.question}
          </h3>

          {/* Prominent Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
              if (!isOptionValidForQuestion(currentQ?.options, idx)) return null;
              const optText = currentQ.options[idx];
              const isSelected = selectedOption === optLabel;
              const isCorrect = currentQ.correct === optLabel;

              let bg = 'rgba(255,255,255,0.07)';
              let border = '1.5px solid rgba(255,255,255,0.15)';

              if (answerState) {
                if (isCorrect) {
                  bg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                  border = '2px solid #6ee7b7';
                } else if (isSelected && !isCorrect) {
                  bg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                  border = '2px solid #fca5a5';
                }
              }

              return (
                <button
                  key={optLabel}
                  onClick={() => handleAnswer(optLabel)}
                  disabled={!!answerState}
                  style={{
                    padding: '18px 22px',
                    borderRadius: '18px',
                    background: bg,
                    border: border,
                    color: '#ffffff',
                    textAlign: 'left',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    cursor: answerState ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 900, 
                    fontSize: '1.15rem',
                    flexShrink: 0 
                  }}>
                    {optLabel}
                  </span>
                  <span style={{ lineHeight: 1.35 }}>{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Turn Controls */}
          {answerState && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderRadius: '18px',
              background: answerState === 'correct' ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)',
              border: answerState === 'correct' ? '1.5px solid #10b981' : '1.5px solid #ef4444',
              marginTop: '8px'
            }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5' }}>
                {answerState === 'correct' 
                  ? `🎉 CHÍNH XÁC! ${teams[activeTeamIndex]?.name} TĂNG TỐC +${percentPerCorrect}% QUÃNG ĐƯỜNG!` 
                  : `❌ CHƯA CHÍNH XÁC!`}
              </div>
              <button
                onClick={handleNextTurn}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)'
                }}
              >
                {totalAnsweredCount + 1 >= totalQuestions ? '🏆 Xem Kết Quả Chung Cuộc' : 'Lượt Đua Tiếp Theo'} <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
