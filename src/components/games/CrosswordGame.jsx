import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion } from '../../utils/universalParser';

// Helper function to extract exact text of correct answer
function getCorrectAnswerText(q) {
  if (!q) return 'DAP AN';

  // If explicit answer / answerText field
  if (q.answerText) return String(q.answerText).trim();
  if (q.answer) return String(q.answer).trim();

  // Handle multiple-choice options & correct key
  if (Array.isArray(q.options) && q.options.length > 0) {
    let targetIdx = -1;
    if (typeof q.correct === 'number') {
      targetIdx = q.correct;
    } else if (typeof q.correct === 'string') {
      const trimmed = q.correct.trim().toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F'].includes(trimmed)) {
        targetIdx = trimmed.charCodeAt(0) - 65; // A -> 0, B -> 1 ...
      } else if (!isNaN(parseInt(trimmed))) {
        targetIdx = parseInt(trimmed);
      }
    }

    if (targetIdx >= 0 && targetIdx < q.options.length) {
      const rawText = String(q.options[targetIdx]).trim();
      // Remove trailing unit code in parentheses if present e.g. "Ampe (A)" -> "Ampe", "Vôn (V)" -> "Vôn"
      const cleaned = rawText.replace(/\s*\([A-Z0-9\s\+\-]+\)$/i, '').trim();
      return cleaned || rawText;
    }

    // If q.correct is directly text (e.g. "Đông Nam Á")
    if (typeof q.correct === 'string' && q.correct.length > 1 && !['A','B','C','D'].includes(q.correct.trim().toUpperCase())) {
      return q.correct.trim();
    }
  }

  return String(q.options?.[0] || 'DAP AN').trim();
}

export function CrosswordGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const [solvedRows, setSolvedRows] = useState([]);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (activeRowIndex === null || answerState) return;
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
  }, [activeRowIndex, answerState]);

  const safeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : [
    {
      question: 'Việt Nam nằm ở khu vực nào của Châu Á?',
      options: ['Đông Á', 'Đông Nam Á', 'Nam Á', 'Tây Nam Á'],
      correct: 'B'
    }
  ];

  const rows = safeQuestions.slice(0, 8).map((q, idx) => {
    const rawAnswer = getCorrectAnswerText(q);
    const fullText = rawAnswer.toUpperCase();
    let hCol = 0;
    if (typeof q.highlightCol === 'number') {
      hCol = Math.max(0, Math.min(q.highlightCol, fullText.length - 1));
    } else if (typeof q.secretCharIndex === 'number') {
      hCol = Math.max(0, Math.min(q.secretCharIndex, fullText.length - 1));
    } else {
      hCol = Math.min(2, Math.max(0, fullText.length - 1));
      if (fullText[hCol] === ' ' && fullText.length > 1) hCol = 0;
    }

    return {
      id: idx,
      clue: q.question || `Câu hỏi hàng ngang #${idx + 1}`,
      answerText: fullText,
      highlightCol: hCol,
      questionObj: q
    };
  });

  // Extract unlocked key letters from solved rows
  const unlockedKeyLetters = solvedRows.map(rIdx => {
    const row = rows[rIdx];
    if (!row || !row.answerText) return null;
    const char = row.answerText[row.highlightCol] || row.answerText[0] || '?';
    return { rIdx, char };
  }).filter(item => item && item.char !== ' ');

  // Deterministically shuffle unlocked letters so they appear in random order (lộn xộn) for students to guess
  const shuffledUnlockedLetters = [...unlockedKeyLetters].sort((a, b) => {
    const hashA = (a.rIdx * 7 + a.char.charCodeAt(0)) % 13;
    const hashB = (b.rIdx * 7 + b.char.charCodeAt(0)) % 13;
    return hashA - hashB;
  });

  const handleRowClick = (idx) => {
    if (solvedRows.includes(idx) || answerState) return;
    setActiveRowIndex(idx);
    setSelectedOption(null);
    setAnswerState(null);
    try { SoundFX.click(); } catch(e) {}
  };

  const handleAnswerOption = (optLabel) => {
    if (answerState || activeRowIndex === null) return;
    setSelectedOption(optLabel);

    const currentQ = rows[activeRowIndex].questionObj;
    if (String(optLabel).toUpperCase() === String(currentQ.correct || 'A').toUpperCase()) {
      setAnswerState('correct');
      try { SoundFX.correct(); } catch(e) {}
      try { confetti({ particleCount: 70, spread: 60 }); } catch(e) {}
      if (onAddPoints) onAddPoints(activeTeamIndex, 100);
      setSolvedRows(prev => [...prev, activeRowIndex]);
    } else {
      setAnswerState('wrong');
      try { SoundFX.wrong(); } catch(e) {}
    }
  };

  const handleCloseModal = () => {
    setActiveRowIndex(null);
    setSelectedOption(null);
    setAnswerState(null);
    if (setActiveTeamIndex && teams && teams.length > 1) {
      setActiveTeamIndex(prev => (prev + 1) % teams.length);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px', maxWidth: '950px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🧩 Ô Chữ Bí Mật - Giải Mã Từ Khóa
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mỗi câu hỏi có đúng số lượng ô tương ứng với từng chữ cái trong đáp án.
          </p>
        </div>

        <div className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
          🔑 ĐÃ GIẢI: {solvedRows.length} / {rows.length} Ô
        </div>
      </div>

      {/* Crossword Grid */}
      <div className="glass-panel" style={{ padding: '28px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((row, rIdx) => {
          const isSolved = solvedRows.includes(rIdx);
          const letters = (row.answerText || 'CAUHOI').split('');

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
              {/* Row Index Badge */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isSolved ? '#10b981' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#fff',
                flexShrink: 0
              }}>
                {rIdx + 1}
              </div>

              {/* Letter Boxes (Matching exact answer length) */}
              <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {letters.map((char, cIdx) => {
                  // Blank separator for space character
                  if (char === ' ') {
                    return (
                      <div
                        key={cIdx}
                        style={{
                          width: '14px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    );
                  }

                  const isHighlight = cIdx === row.highlightCol;
                  return (
                    <div
                      key={cIdx}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: isSolved 
                          ? (isHighlight ? '#f59e0b' : 'rgba(16, 185, 129, 0.25)')
                          : (isHighlight ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.06)'),
                        border: isHighlight ? '2px solid #f59e0b' : (isSolved ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.18)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.15rem',
                        color: isSolved ? '#ffffff' : 'rgba(255,255,255,0.25)',
                        textShadow: isSolved ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                        boxShadow: isSolved ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                    >
                      {isSolved ? char : '?'}
                    </div>
                  );
                })}
              </div>

              <span style={{ fontSize: '0.85rem', color: isSolved ? '#6ee7b7' : 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                {isSolved ? '✓ ĐÃ GIẢI' : 'Bấm để giải ô này'}
              </span>
            </div>
          );
        })}
      </div>

      {/* SHUFFLED KEY LETTERS TRAY (KHAY CHỮ CÁI CHÌA KHÓA XÁO TRỘN) */}
      <div className="glass-panel" style={{
        width: '100%',
        padding: '24px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 8px 30px rgba(245, 158, 11, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔑 KHAY CHỮ CÁI CHÌA KHÓA BÍ MẬT (ĐÃ XÁO TRỘN)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mỗi hàng ngang giải đúng sẽ tự động gửi 1 chữ cái chìa khóa vào khay bên dưới theo thứ tự ngẫu nhiên để học sinh đoán từ khóa!
            </p>
          </div>

          <span className="badge badge-accent" style={{ background: '#f59e0b', color: '#000', fontWeight: 900, padding: '6px 14px' }}>
            {unlockedKeyLetters.length} / {rows.length} Ô CHÌA KHÓA
          </span>
        </div>

        {/* Shuffled Unlocked Key Tiles */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '68px',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '16px',
          border: '1.5px dashed rgba(245, 158, 11, 0.4)'
        }}>
          {rows.map((row, rIdx) => {
            const isUnlocked = solvedRows.includes(rIdx);
            const itemObj = isUnlocked ? shuffledUnlockedLetters.find(item => item.rIdx === rIdx) : null;

            return (
              <div
                key={rIdx}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: isUnlocked ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.05)',
                  border: isUnlocked ? '2px solid #fef08a' : '1.5px dashed rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  color: isUnlocked ? '#ffffff' : 'rgba(255,255,255,0.2)',
                  boxShadow: isUnlocked ? '0 0 16px rgba(245, 158, 11, 0.6)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isUnlocked ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {isUnlocked && itemObj ? itemObj.char : '?'}
              </div>
            );
          })}
        </div>
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
                🧩 HÀNG NGANG SỐ #{activeRowIndex + 1} ({rows[activeRowIndex].answerText.replace(/\s+/g, '').length} CHỮ CÁI)
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '24px', lineHeight: 1.4 }}>
              {rows[activeRowIndex].questionObj.question}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
                if (!isOptionValidForQuestion(rows[activeRowIndex].questionObj?.options, idx)) return null;
                const optText = rows[activeRowIndex].questionObj.options?.[idx];
                const isSelected = selectedOption === optLabel;
                const isCorrect = String(rows[activeRowIndex].questionObj.correct || 'A').toUpperCase() === optLabel;

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
              <div style={{ padding: '16px', borderRadius: '14px', background: answerState === 'correct' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontWeight: 800, color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5' }}>
                  {answerState === 'correct' ? `🎉 ĐÚNG RỒI! GIẢI THÀNH CÔNG Ô HÀNG NGANG SỐ #${activeRowIndex + 1}: "${rows[activeRowIndex].answerText}"` : `❌ TIẾC QUÁ!`}
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
