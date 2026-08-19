import React, { useState } from 'react';
import { Shield, Flame, RotateCcw, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

export function MinesweeperGame({ questions, teams, onAddPoints }) {
  const [lives, setLives] = useState(3);
  const [clearedTiles, setClearedTiles] = useState([]);
  const [activeTileIndex, setActiveTileIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const totalTiles = 12;
  const currentQ = activeTileIndex !== null ? (questions[activeTileIndex % questions.length] || questions[0]) : null;

  const handleTileClick = (idx) => {
    if (clearedTiles.includes(idx) || answerState || lives <= 0) return;
    setActiveTileIndex(idx);
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
      confetti({ particleCount: 70, spread: 60 });
      onAddPoints(0, 100);
      setClearedTiles([...clearedTiles, activeTileIndex]);
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setIsGameOver(true);
      }
    }
  };

  const handleCloseQuestionModal = () => {
    setActiveTileIndex(null);
    setSelectedOption(null);
    setAnswerState(null);
  };

  const handleResetGame = () => {
    setLives(3);
    setClearedTiles([]);
    setActiveTileIndex(null);
    setSelectedOption(null);
    setAnswerState(null);
    setIsGameOver(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 20px', width: '100%', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            💣 Dò Mìn Phiêu Lưu - Vượt Bãi Mìn
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Chọn ô an toàn và giải đố để vượt qua bãi mìn. Bạn có 3 mạng sống!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Hearts Lives */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', padding: '6px 14px', borderRadius: '12px', border: '1px solid #ef4444' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fca5a5', marginRight: '4px' }}>Mạng:</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} size={18} fill={i < lives ? '#ef4444' : 'none'} color={i < lives ? '#ef4444' : '#64748b'} />
            ))}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleResetGame}>
            <RotateCcw size={16} /> Chơi Lại
          </button>
        </div>
      </div>

      {/* Minefield Grid */}
      {isGameOver ? (
        <div className="glass-panel" style={{ width: '100%', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>💥</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fca5a5' }}>
            BÃI MÌN PHÁT NỔ! GAME OVER!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
            Bạn đã dùng hết 3 mạng sống. Hãy thử lại để chinh phục bãi mìn!
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleResetGame}>
            Thử Lại Ngay
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          width: '100%',
          padding: '24px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(139, 94, 60, 0.15) 0%, rgba(184, 138, 90, 0.15) 100%)',
          border: '2px solid rgba(184, 138, 90, 0.4)'
        }}>
          {Array.from({ length: totalTiles }).map((_, idx) => {
            const isCleared = clearedTiles.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => handleTileClick(idx)}
                style={{
                  height: '110px',
                  borderRadius: '18px',
                  background: isCleared ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                  border: isCleared ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isCleared ? 'default' : 'pointer',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#fff',
                  boxShadow: isCleared ? 'none' : '0 6px 20px rgba(0,0,0,0.3)',
                  transition: 'all 0.25s ease'
                }}
                className={!isCleared ? 'animate-pulse-glow' : ''}
              >
                {isCleared ? '🛡️' : '💣'}
                <span style={{ fontSize: '0.8rem', color: isCleared ? '#6ee7b7' : 'var(--text-muted)', marginTop: '4px' }}>
                  {isCleared ? 'AN TOÀN' : `Ô #${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Question Modal */}
      {activeTileIndex !== null && currentQ && !isGameOver && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '700px', padding: '32px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span className="badge badge-accent">
                💣 THỬ THÁCH DÒ MÌN Ô #{activeTileIndex + 1}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart key={i} size={16} fill={i < lives ? '#ef4444' : 'none'} color={i < lives ? '#ef4444' : '#64748b'} />
                ))}
              </div>
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
                  {answerState === 'correct' ? `🎉 ĐÚNG RỒI! BẮT THÀNH CÔNG VỚI AN TOÀN (+100 ĐIỂM)!` : `💥 MÌN PHÁT NỔ! BẠN MẤT 1 MẠNG!`}
                </div>
                <button className="btn btn-primary" onClick={handleCloseQuestionModal}>
                  Tiếp Tục Phiêu Lưu
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
