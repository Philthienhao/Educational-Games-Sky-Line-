import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, XCircle, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion } from '../../utils/universalParser';

export function PictureFlipGame({ questions, teams, onAddPoints, game, secretImage, activeTeamIndex = 0, setActiveTeamIndex }) {
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [activeTileIndex, setActiveTileIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [guessText, setGuessText] = useState('');
  const [isPictureRevealed, setIsPictureRevealed] = useState(false);
  const [customImage, setCustomImage] = useState('');

  // Turn management
  const [localTeam, setLocalTeam] = useState(0);
  const currentTeamIdx = setActiveTeamIndex !== undefined ? activeTeamIndex : localTeam;
  const setTurnTeam = (newIdx) => {
    if (setActiveTeamIndex) setActiveTeamIndex(newIdx);
    else setLocalTeam(newIdx);
  };

  // Hidden background image: Custom -> secretImage -> game.secretImage -> fallback
  const bgImageUrl = customImage || secretImage || game?.secretImage || game?.bgImageUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop';
  
  // Dynamic puzzle grid matching ALL uploaded questions (unlimited)
  const totalTiles = Math.max(6, questions?.length || 9);

  const currentQ = activeTileIndex !== null ? (questions[activeTileIndex % questions.length] || questions[0]) : null;
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (activeTileIndex === null || answerState) return;
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
  }, [activeTileIndex, answerState]);

  const handleTileClick = (idx) => {
    if (revealedTiles.includes(idx) || answerState) return;
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
      onAddPoints(currentTeamIdx, 100);
      setRevealedTiles([...revealedTiles, activeTileIndex]);
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  const handleCloseQuestion = () => {
    setActiveTileIndex(null);
    setSelectedOption(null);
    setAnswerState(null);
    setTurnTeam((currentTeamIdx + 1) % teams.length);
  };

  const handleRevealAll = () => {
    setIsPictureRevealed(true);
    setRevealedTiles(Array.from({ length: totalTiles }, (_, i) => i));
    SoundFX.fanfare();
    confetti({ particleCount: 120, spread: 90 });
  };

  const handleQuickImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target.result);
      SoundFX.correct();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🖼️ Lật Ô Vuông - Đoán Bức Ảnh Bí Mật
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Trả lời đúng từng ô để mở dần bức tranh chìa khóa đằng sau.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Change Secret Image Button */}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleQuickImageUpload} 
            style={{ display: 'none' }} 
            id="quick-image-upload-input" 
          />
          <label 
            htmlFor="quick-image-upload-input"
            className="btn btn-secondary"
            style={{ background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #ec4899', color: '#f472b6', cursor: 'pointer' }}
            title="Đổi ảnh chìa khóa bí mật nhanh"
          >
            <Upload size={16} /> Tải Ảnh Chìa Khóa Nhanh
          </label>

          <button 
            className="btn btn-accent"
            onClick={handleRevealAll}
          >
            <Eye size={18} />
            Mở Toàn Bộ Bức Ảnh
          </button>
        </div>
      </div>

      {/* Grid of 9 Tiles covering background picture */}
      <div style={{
        position: 'relative',
        width: '540px',
        height: '400px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '3px solid rgba(255,255,255,0.2)',
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)'
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
          const isRevealed = revealedTiles.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => handleTileClick(idx)}
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                background: isRevealed ? 'transparent' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                opacity: isRevealed ? 0 : 1,
                transition: 'opacity 0.6s ease, transform 0.4s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isRevealed ? 'default' : 'pointer',
                fontWeight: 900,
                fontSize: '1.6rem',
                color: '#8b5cf6'
              }}
            >
              {!isRevealed && `Mảnh #${idx + 1}`}
            </div>
          );
        })}
      </div>

      {/* Question Modal Popup */}
      {activeTileIndex !== null && currentQ && (
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
              <span className="badge badge-teacher">
                MẢNH GHÉP SỐ #{activeTileIndex + 1}
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '24px', lineHeight: 1.4 }}>
              {currentQ.question}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
                if (!isOptionValidForQuestion(currentQ?.options, idx)) return null;
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
                  {answerState === 'correct' ? `🎉 ĐÚNG RỒI! MẢNH GHÉP SỐ #${activeTileIndex + 1} ĐÃ ĐƯỢC LẬT MỞ!` : `❌ TIẾC QUÁ!`}
                </div>
                <button className="btn btn-primary" onClick={handleCloseQuestion}>
                  Tiếp Tục
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
