import React, { useState, useEffect } from 'react';
import { HelpCircle, Users, RotateCw, Trophy, AlertTriangle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { isOptionValidForQuestion } from '../../utils/universalParser';

export function MillionaireGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null); // 'correct' | 'wrong'

  const [localTeam, setLocalTeam] = useState(0);
  const currentTeamIdx = setActiveTeamIndex !== undefined ? activeTeamIndex : localTeam;
  const setTurnTeam = (newIdx) => {
    if (setActiveTeamIndex) setActiveTeamIndex(newIdx);
    else setLocalTeam(newIdx);
  };
  
  // Lifelines
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [usedAudience, setUsedAudience] = useState(false);
  const [audiencePoll, setAudiencePoll] = useState(null);
  const [usedSwitch, setUsedSwitch] = useState(false);

  const moneyLadder = [
    '100 ĐIỂM', '200 ĐIỂM', '300 ĐIỂM', '500 ĐIỂM', '1.000 ĐIỂM ⭐',
    '2.000 ĐIỂM', '4.000 ĐIỂM', '8.000 ĐIỂM', '16.000 ĐIỂM', '32.000 ĐIỂM ⭐',
    '64.000 ĐIỂM', '125.000 ĐIỂM', '250.000 ĐIỂM', '500.000 ĐIỂM', '1.000.000 ĐIỂM 🏆'
  ];

  const currentQ = questions[currentLevel % questions.length] || questions[0];
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (!isGameStarted || answerState) return;
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
  }, [isGameStarted, currentLevel, currentTeamIdx, answerState]);

  // Lifeline 50:50
  const handle5050 = () => {
    if (used5050 || answerState) return;
    setUsed5050(true);
    SoundFX.click();

    const wrongLabels = ['A', 'B', 'C', 'D'].filter(l => l !== currentQ.correct);
    // Shuffle wrong labels and take 2
    const toHide = wrongLabels.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
  };

  // Lifeline Audience Poll
  const handleAudience = () => {
    if (usedAudience || answerState) return;
    setUsedAudience(true);
    SoundFX.click();

    const correctLabel = currentQ.correct;
    const poll = { A: 10, B: 10, C: 10, D: 10 };
    poll[correctLabel] = 60 + Math.floor(Math.random() * 20);
    let remaining = 100 - poll[correctLabel];

    ['A', 'B', 'C', 'D'].filter(l => l !== correctLabel).forEach((label, idx) => {
      if (idx === 2) poll[label] = remaining;
      else {
        const val = Math.floor(Math.random() * remaining);
        poll[label] = val;
        remaining -= val;
      }
    });

    setAudiencePoll(poll);
  };

  // Lifeline Switch Question
  const handleSwitchQuestion = () => {
    if (usedSwitch || answerState) return;
    setUsedSwitch(true);
    SoundFX.click();
    setHiddenOptions([]);
    setAudiencePoll(null);
    setSelectedOption(null);
    setCurrentLevel(prev => (prev + 1) % questions.length);
  };

  // Answer selection
  const handleSelectOption = (optLabel) => {
    if (answerState) return;
    setSelectedOption(optLabel);

    if (optLabel === currentQ.correct) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 80, spread: 70 });
      onAddPoints(currentTeamIdx, 100 * (currentLevel + 1));
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  const handleNextLevel = () => {
    setSelectedOption(null);
    setAnswerState(null);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setCurrentLevel(prev => prev + 1);
    setTurnTeam((currentTeamIdx + 1) % teams.length);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Left Main Quiz Arena */}
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {!isGameStarted ? (
          <StartGameOverlay
            title="Ai Là Triệu Phú"
            icon="💰"
            onStart={() => setIsGameStarted(true)}
          />
        ) : (
          <>
            {/* Top Lifelines Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>
              MỐC CÂU HỎI SỐ {currentLevel + 1}: <span style={{ color: '#fff' }}>{moneyLadder[currentLevel]}</span>
            </div>
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
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handle5050}
              disabled={used5050 || !!answerState}
              style={{ opacity: used5050 ? 0.4 : 1 }}
              title="Quyền trợ giúp 50:50 (Loại bỏ 2 phương án sai)"
            >
              <HelpCircle size={16} /> 50:50
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleAudience}
              disabled={usedAudience || !!answerState}
              style={{ opacity: usedAudience ? 0.4 : 1 }}
              title="Hỏi ý kiến khán giả"
            >
              <Users size={16} /> Khán Giả
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleSwitchQuestion}
              disabled={usedSwitch || !!answerState}
              style={{ opacity: usedSwitch ? 0.4 : 1 }}
              title="Đổi sang câu hỏi khác"
            >
              <RotateCw size={16} /> Đổi Câu
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div style={{
          padding: '24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.4)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.4 }}>
            {currentQ.question}
          </h2>
        </div>

        {/* Audience Poll Modal Overlay if used */}
        {audiencePoll && (
          <div style={{ marginBottom: '20px', padding: '14px 20px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6' }}>
            <div style={{ fontWeight: 800, color: '#93c5fd', marginBottom: '8px', fontSize: '0.85rem' }}>
              📊 Ý KIẾN KHÁN GIẢ:
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
              <span>A: {audiencePoll.A}%</span>
              <span>B: {audiencePoll.B}%</span>
              <span>C: {audiencePoll.C}%</span>
              <span>D: {audiencePoll.D}%</span>
            </div>
          </div>
        )}

        {/* Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
            if (!isOptionValidForQuestion(currentQ?.options, idx)) return null;
            const optText = currentQ.options[idx];
            const isHidden = hiddenOptions.includes(optLabel);
            const isSelected = selectedOption === optLabel;
            const isCorrect = currentQ.correct === optLabel;

            let bg = 'rgba(255,255,255,0.06)';
            let border = '1px solid rgba(255,255,255,0.15)';

            if (answerState) {
              if (isCorrect) {
                bg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                border = '1.5px solid #6ee7b7';
              } else if (isSelected && !isCorrect) {
                bg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                border = '1.5px solid #fca5a5';
              }
            }

            if (isHidden) {
              return (
                <div key={optLabel} style={{ padding: '16px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.08)', visibility: 'hidden' }} />
              );
            }

            return (
              <button
                key={optLabel}
                onClick={() => handleSelectOption(optLabel)}
                disabled={!!answerState}
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: bg,
                  border: border,
                  color: '#fff',
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: answerState ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}>
                  {optLabel}
                </span>
                {optText}
              </button>
            );
          })}
        </div>

        {/* Feedback & Next */}
        {answerState && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: answerState === 'correct' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: answerState === 'correct' ? '1px solid #10b981' : '1px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5', fontSize: '1.1rem' }}>
                {answerState === 'correct' ? '🎉 CHÍNH XÁC! BẠN ĐÃ VƯỢT QUA MỐC THƯỞNG!' : `❌ TIẾC QUÁ! Đáp án đúng là (${currentQ.correct})`}
              </div>
              {currentQ.explanation && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  💡 Gợi ý: {currentQ.explanation}
                </div>
              )}
            </div>

            <button className="btn btn-primary" onClick={handleNextLevel}>
              Tiếp Tục Chinh Phục
            </button>
          </div>
        )}

          </>
        )}
      </div>

      {/* Right Money Ladder Side Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '12px', textAlign: 'center' }}>
          🏆 THANG THƯỞNG AI LÀ TRIỆU PHÚ
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '6px' }}>
          {moneyLadder.map((step, idx) => {
            const isCurrent = currentLevel === idx;
            const isPassed = currentLevel > idx;

            let bg = 'rgba(255, 255, 255, 0.04)';
            let color = 'var(--text-muted)';

            if (isCurrent) {
              bg = 'var(--accent-gold)';
              color = '#1e1b4b';
            } else if (isPassed) {
              bg = 'rgba(16, 185, 129, 0.2)';
              color = '#6ee7b7';
            }

            return (
              <div
                key={idx}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: bg,
                  color: color,
                  fontWeight: isCurrent ? 900 : 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Câu {idx + 1}</span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
