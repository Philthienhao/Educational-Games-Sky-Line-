import React, { useState } from 'react';
import { KeyRound, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

export function CrosswordGame({ questions, teams, onAddPoints }) {
  const [solvedRows, setSolvedRows] = useState([]);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);

  const secretKeyword = "HỌC TẬP";

  const rows = questions.slice(0, 6).map((q, idx) => ({
    id: idx,
    clue: q.question,
    answerText: q.options[0], // First option as representation
    highlightCol: 2,
    questionObj: q
  }));

  const handleRowClick = (idx) => {
    if (solvedRows.includes(idx) || answerState) return;
    setActiveRowIndex(idx);
    setSelectedOption(null);
    setAnswerState(null);
    SoundFX.click();
  };

  const handleAnswerOption = (optLabel) => {
    if (answerState || activeRowIndex === null) return;
    setSelectedOption(optLabel);

    const currentQ = rows[activeRowIndex].questionObj;
    if (optLabel === currentQ.correct) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 70, spread: 60 });
      onAddPoints(0, 100);
      setSolvedRows([...solvedRows, activeRowIndex]);
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  const handleCloseModal = () => {
    setActiveRowIndex(null);
    setSelectedOption(null);
    setAnswerState(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🧩 Ô Chữ Bí Mật - Giải Mã Từ Khóa
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Giải các ô chữ hàng ngang để lật mở cột TỪ KHÓA BÍ MẬT hàng dọc.
          </p>
        </div>

        <div className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
          🔑 ĐÃ GIẢI: {solvedRows.length} / {rows.length} Ô
        </div>
      </div>

      {/* Crossword Grid */}
      <div className="glass-panel" style={{ padding: '32px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((row, rIdx) => {
          const isSolved = solvedRows.includes(rIdx);
          const letters = (row.answerText || 'CAUHOI').toUpperCase().split('');

          return (
            <div
              key={rIdx}
              onClick={() => handleRowClick(rIdx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '14px',
                background: isSolved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                border: isSolved ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                cursor: isSolved ? 'default' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isSolved ? '#10b981' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#fff'
              }}>
                {rIdx + 1}
              </div>

              {/* Letter Boxes */}
              <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                {letters.map((char, cIdx) => {
                  const isHighlight = cIdx === row.highlightCol;
                  return (
                    <div
                      key={cIdx}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: isSolved 
                          ? (isHighlight ? '#f59e0b' : 'rgba(255,255,255,0.2)')
                          : (isHighlight ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.05)'),
                        border: isHighlight ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        color: isSolved ? '#fff' : 'transparent',
                        textShadow: isSolved ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                      }}
                    >
                      {isSolved ? char : '?'}
                    </div>
                  );
                })}
              </div>

              <span style={{ fontSize: '0.85rem', color: isSolved ? '#6ee7b7' : 'var(--text-muted)', fontWeight: 600 }}>
                {isSolved ? '✓ ĐÃ GIẢI' : 'Bấm để giải ô này'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Row Question Modal */}
      {activeRowIndex !== null && (
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
              <span className="badge badge-accent">
                🧩 HÀNG NGANG SỐ #{activeRowIndex + 1}
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '24px', lineHeight: 1.4 }}>
              {rows[activeRowIndex].questionObj.question}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
                const optText = rows[activeRowIndex].questionObj.options[idx];
                const isSelected = selectedOption === optLabel;
                const isCorrect = rows[activeRowIndex].questionObj.correct === optLabel;

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
                  {answerState === 'correct' ? `🎉 ĐÚNG RỒI! GIẢI THÀNH CÔNG Ô HÀNG NGANG SỐ #${activeRowIndex + 1}!` : `❌ TIẾC QUÁ!`}
                </div>
                <button className="btn btn-primary" onClick={handleCloseModal}>
                  Đóng Hàng Ngang
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
