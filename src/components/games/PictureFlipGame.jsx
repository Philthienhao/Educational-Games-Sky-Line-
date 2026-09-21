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
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(12px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '920px', padding: '36px', borderRadius: '28px', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <span className="badge badge-teacher" style={{ fontSize: '1rem', padding: '8px 18px', borderRadius: '14px', fontWeight: 900 }}>
                🧩 MẢNH GHÉP SỐ #{activeTileIndex + 1}
              </span>

              {/* 20 Seconds Countdown Timer Display */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: timeLeft <= 5 ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                padding: '8px 22px',
                borderRadius: '24px',
                fontWeight: 900,
                fontSize: '1.25rem',
                border: '1.5px solid rgba(255,255,255,0.4)',
                boxShadow: timeLeft <= 5 ? '0 0 20px rgba(239, 68, 68, 0.8)' : '0 4px 16px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.3s ease'
              }}>
                ⏱️ Thời gian: <span style={{ fontSize: '1.5rem', color: '#fef08a' }}>{timeLeft}s</span>
              </div>
            </div>

            {/* Question Image if present */}
            {currentQ.image && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img 
                  src={currentQ.image} 
                  alt="Câu hỏi" 
                  style={{ maxHeight: '260px', maxWidth: '100%', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)', objectFit: 'contain' }} 
                />
              </div>
            )}

            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: '28px', lineHeight: 1.45, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {currentQ.question}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
                if (!isOptionValidForQuestion(currentQ?.options, idx)) return null;
                const optText = currentQ.options[idx];
                const isSelected = selectedOption === optLabel;
                const isCorrect = currentQ.correct === optLabel;

                let bg = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
                let border = '2px solid #334155';
                let textColor = '#ffffff';
                let badgeBg = '#2563eb';

                if (answerState) {
                  if (isCorrect) {
                    bg = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
                    border = '2px solid #6ee7b7';
                    badgeBg = '#047857';
                  } else if (isSelected && !isCorrect) {
                    bg = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
                    border = '2px solid #fca5a5';
                    badgeBg = '#991b1b';
                  }
                }

                return (
                  <button
                    key={optLabel}
                    onClick={() => handleAnswerOption(optLabel)}
                    disabled={!!answerState}
                    style={{
                      padding: '20px 24px',
                      borderRadius: '20px',
                      background: bg,
                      border: border,
                      color: textColor,
                      textAlign: 'left',
                      fontWeight: 800,
                      fontSize: '1.3rem',
                      lineHeight: 1.4,
                      cursor: answerState ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '38px',
                      height: '38px',
                      minWidth: '38px',
                      borderRadius: '12px',
                      background: badgeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {optLabel}
                    </span>
                    <span style={{ flex: 1, color: '#ffffff', fontWeight: 800 }}>{optText}</span>
                  </button>
                );
              })}
            </div>

            {answerState && (
              <div style={{ padding: '20px 24px', borderRadius: '18px', background: answerState === 'correct' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', border: answerState === 'correct' ? '1px solid #10b981' : '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5' }}>
                  {answerState === 'correct' ? `🎉 ĐÚNG RỒI! MẢNH GHÉP SỐ #${activeTileIndex + 1} ĐÃ ĐƯỢC LẬT MỞ!` : answerState === 'timeout' ? `⏱️ HẾT GIỜ! HỌC SINH CHƯA ĐƯA RA CÂU TRẢ LỜI!` : `❌ TIẾC QUÁ! CÂU TRẢ LỜI CHƯA CHÍNH XÁC!`}
                </div>
                <button className="btn btn-primary" onClick={handleCloseQuestion} style={{ padding: '12px 28px', fontSize: '1.1rem', fontWeight: 900, borderRadius: '14px' }}>
                  Tiếp Tục ➔
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
