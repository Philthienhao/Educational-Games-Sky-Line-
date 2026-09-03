import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, CheckCircle2, XCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { isOptionValidForQuestion } from '../../utils/universalParser';

const TEAM_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export function KnowledgeTrainGame({ questions, teams = [], onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const safeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : [
    {
      question: 'Việt Nam nằm ở khu vực nào của Châu Á?',
      options: ['Đông Á', 'Đông Nam Á', 'Nam Á', 'Tây Nam Á'],
      correct: 'B'
    }
  ];

  const totalRequiredCars = Math.min(5, safeQuestions.length);

  const activeTeams = (Array.isArray(teams) && teams.length > 0) ? teams : [
    { id: 't1', name: 'Đội Đỏ (Đội 1)', color: '#ef4444', score: 0 },
    { id: 't2', name: 'Đội Xanh (Đội 2)', color: '#3b82f6', score: 0 }
  ];

  // Safely derive active team index
  const safeActiveIdx = Math.max(0, activeTeamIndex >= 0 ? activeTeamIndex % activeTeams.length : 0);
  const currentTeamObj = activeTeams[safeActiveIdx] || activeTeams[0];
  const currentTeamColor = currentTeamObj.color || TEAM_COLORS[safeActiveIdx % TEAM_COLORS.length];

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [totalAnsweredCount, setTotalAnsweredCount] = useState(0);
  // Store connected train cars per team index: { 0: [car1, car2], 1: [car1], ... }
  const [teamCarsMap, setTeamCarsMap] = useState({});

  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [winReason, setWinReason] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);

  const currentQ = safeQuestions[currentQIndex % safeQuestions.length];

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
  }, [isGameStarted, currentQIndex, safeActiveIdx, answerState, winnerTeam]);

  const handleAnswerOption = (optLabel) => {
    if (answerState || winnerTeam) return;
    setSelectedOption(optLabel);

    const isCorrect = String(optLabel).toUpperCase() === String(currentQ.correct || 'A').toUpperCase();

    if (isCorrect) {
      setAnswerState('correct');
      try { SoundFX.correct(); } catch(e) {}
      try { confetti({ particleCount: 80, spread: 70 }); } catch(e) {}
      if (onAddPoints) onAddPoints(safeActiveIdx, 100);

      // Attach train car ONLY to current active team
      const existingCars = teamCarsMap[safeActiveIdx] || [];
      const newCar = {
        id: `car_${Date.now()}_${existingCars.length + 1}`,
        qIndex: currentQIndex,
        title: `Toa Tri Thức #${existingCars.length + 1}`
      };

      const updatedCars = [...existingCars, newCar];
      const newMap = { ...teamCarsMap, [safeActiveIdx]: updatedCars };
      setTeamCarsMap(newMap);

      if (updatedCars.length >= totalRequiredCars) {
        setWinnerTeam(currentTeamObj.name);
        setWinReason(`Đã xuất sắc ghép đủ ${totalRequiredCars} toa tàu tri thức sớm nhất!`);
        try { SoundFX.fanfare(); } catch(e) {}
        try { confetti({ particleCount: 180, spread: 100 }); } catch(e) {}
      }
    } else {
      setAnswerState('wrong');
      try { SoundFX.wrong(); } catch(e) {}
    }
  };

  const evaluateWinnerByScoreOrCars = () => {
    let bestTeamIdx = 0;
    let maxCars = -1;
    let maxScore = -99999;

    activeTeams.forEach((team, idx) => {
      const cars = (teamCarsMap[idx] || []).length;
      const score = team.score || 0;
      if (cars > maxCars || (cars === maxCars && score > maxScore)) {
        maxCars = cars;
        maxScore = score;
        bestTeamIdx = idx;
      }
    });

    const winningTeam = activeTeams[bestTeamIdx];
    if (winningTeam) {
      const cars = (teamCarsMap[bestTeamIdx] || []).length;
      setWinnerTeam(winningTeam.name);
      setWinReason(`Đã đạt điểm số (${winningTeam.score || 0}đ) và sở hữu ${cars} toa tàu cao nhất cuộc thi!`);
      try { SoundFX.fanfare(); } catch(e) {}
      try { confetti({ particleCount: 200, spread: 120 }); } catch(e) {}
    }
  };

  const handleNextTurn = () => {
    setSelectedOption(null);
    setAnswerState(null);

    const nextAnswered = totalAnsweredCount + 1;
    setTotalAnsweredCount(nextAnswered);

    if (nextAnswered >= safeQuestions.length && !winnerTeam) {
      evaluateWinnerByScoreOrCars();
      return;
    }

    setCurrentQIndex(prev => (prev + 1) % safeQuestions.length);
    if (setActiveTeamIndex && activeTeams.length > 0) {
      setActiveTeamIndex(prev => (prev + 1) % activeTeams.length);
    }
  };

  const handleResetTrainRace = () => {
    setTeamCarsMap({});
    setWinnerTeam(null);
    setWinReason('');
    setSelectedOption(null);
    setAnswerState(null);
    setCurrentQIndex(0);
    setTotalAnsweredCount(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '10px 20px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🚂 Cuộc Đua Đoàn Tàu Tri Thức ({activeTeams.length} Đội Thi Đua)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Trả lời đúng câu hỏi để ghép thêm 1 toa tàu vào đúng đoàn tàu của mình. Đội nào đạt <strong>{totalRequiredCars} toa tàu</strong> trước sẽ chiến thắng!
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleResetTrainRace}>
          <RotateCcw size={16} /> Đặt Lại Cuộc Đua Tàu
        </button>
      </div>

      {/* DYNAMIC TRAIN TRACKS FOR ALL TEAMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {activeTeams.map((team, idx) => {
          const cars = teamCarsMap[idx] || [];
          const isTurn = safeActiveIdx === idx;
          const color = team.color || TEAM_COLORS[idx % TEAM_COLORS.length];
          const progressPct = Math.round((cars.length / totalRequiredCars) * 100);

          return (
            <div 
              key={team.id || idx}
              className="glass-panel" 
              style={{
                padding: '14px 20px',
                borderRadius: '20px',
                background: isTurn 
                  ? `linear-gradient(135deg, ${color}25 0%, rgba(15, 23, 42, 0.95) 100%)` 
                  : 'rgba(15, 23, 42, 0.6)',
                border: isTurn ? `3px solid ${color}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isTurn ? `0 0 24px ${color}50` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isTurn && <span style={{ background: color, color: '#fff', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '8px', fontWeight: 900, boxShadow: `0 2px 8px ${color}80` }}>🏷️ ĐẾN LƯỢT</span>}
                  🚂 {team.name} ({cars.length}/{totalRequiredCars} Toa) — {team.score || 0}đ
                </span>
                <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 800 }}>
                  Tiến độ: {progressPct}%
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '6px 0' }}>
                {/* Locomotive */}
                <div style={{ padding: '10px 18px', borderRadius: '14px', background: `linear-gradient(135deg, ${color} 0%, #0f172a 100%)`, color: '#fff', fontWeight: 900, fontSize: '0.95rem', boxShadow: `0 4px 14px ${color}50`, flexShrink: 0, border: `1.5px solid ${color}` }}>
                  🚂 ĐẦU TÀU {team.name.toUpperCase()}
                </div>

                {/* Attached Cars */}
                {cars.map((car, cIdx) => (
                  <div key={car.id} style={{ padding: '10px 14px', borderRadius: '12px', background: color, color: '#fff', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0, boxShadow: `0 4px 10px ${color}40`, border: '1px solid rgba(255,255,255,0.5)' }}>
                    🚃 Toa #{cIdx + 1}
                  </div>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, totalRequiredCars - cars.length) }).map((_, sIdx) => (
                  <div key={sIdx} style={{ padding: '10px 14px', borderRadius: '12px', border: `2px dashed ${color}50`, color: `${color}a0`, fontSize: '0.82rem', flexShrink: 0 }}>
                    + Toa #{cars.length + sIdx + 1}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* WINNER ANNOUNCEMENT OVERLAY */}
      {winnerTeam && (
        <div style={{
          width: '100%',
          padding: '32px 24px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 900,
          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Trophy size={60} color="#fef08a" className="animate-bounce" />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            🎉 XUẤT SẮC! {winnerTeam.toUpperCase()} ĐÃ GIÀNH CHIẾN THÀNG!
          </h2>
          {winReason && (
            <p style={{ fontSize: '1.05rem', color: '#d1fae5', fontWeight: 700, margin: 0, maxWidth: '600px' }}>
              {winReason}
            </p>
          )}

          {/* Standings list */}
          <div style={{ width: '100%', maxWidth: '480px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, fontWeight: 900 }}>
              📊 BẢNG XẾP HẠNG CHUNG CUỘC
            </h4>
            {activeTeams
              .map((t, idx) => ({ ...t, cars: (teamCarsMap[idx] || []).length }))
              .sort((a, b) => b.cars - a.cars || (b.score || 0) - (a.score || 0))
              .map((t, rankIdx) => (
                <div key={t.id || rankIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderRadius: '10px', background: t.name === winnerTeam ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', border: t.name === winnerTeam ? '1px solid #fef08a' : 'none', fontWeight: 800, fontSize: '0.9rem' }}>
                  <span>{rankIdx === 0 ? '🥇' : rankIdx === 1 ? '🥈' : rankIdx === 2 ? '🥉' : '🎗️'} Hạng {rankIdx + 1}: {t.name}</span>
                  <span>{t.cars} Toa — {t.score || 0}đ</span>
                </div>
              ))}
          </div>

          <button className="btn btn-secondary btn-md" onClick={handleResetTrainRace} style={{ background: '#fff', color: '#047857', fontWeight: 900, fontSize: '1rem', padding: '12px 28px' }}>
            Ván Đua Tàu Mới 🔄
          </button>
        </div>
      )}

      {/* START GAME OVERLAY */}
      {!isGameStarted ? (
        <StartGameOverlay
          title="Đoàn Tàu Tri Thức"
          icon="🚂"
          onStart={() => setIsGameStarted(true)}
        />
      ) : !winnerTeam && (
        <div className="glass-panel" style={{
          width: '100%',
          padding: '28px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: `3px solid ${currentTeamColor}`,
          boxShadow: `0 0 25px ${currentTeamColor}30`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span className="badge badge-accent" style={{ background: currentTeamColor, color: '#fff', fontWeight: 900, padding: '6px 16px', fontSize: '0.95rem' }}>
              👑 ĐẾN LƯỢT: {currentTeamObj.name.toUpperCase()}
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

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800 }}>
              Câu hỏi #{currentQIndex + 1} / {safeQuestions.length}
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', lineHeight: 1.4 }}>
            {currentQ.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
              if (!isOptionValidForQuestion(currentQ?.options, idx)) return null;
              const optText = currentQ.options?.[idx];
              const isSelected = selectedOption === optLabel;
              const isCorrect = String(currentQ.correct || 'A').toUpperCase() === optLabel;

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
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                    {optLabel}
                  </span>
                  {optText}
                </button>
              );
            })}
          </div>

          {answerState && (
            <div style={{ padding: '16px 20px', borderRadius: '16px', background: answerState === 'correct' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontWeight: 800, color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5' }}>
                {answerState === 'correct' ? `🎉 ĐÚNG RỒI! ĐÃ THÊM 1 TOA TÀU CHO ${currentTeamObj.name.toUpperCase()}!` : `❌ TIẾC QUÁ! RẤT TIẾC CÂU NÀY BẠN TRẢ LỜI CHƯA ĐÚNG.`}
              </div>
              <button className="btn btn-primary" onClick={handleNextTurn}>
                Lượt Tiếp Theo ➔
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
