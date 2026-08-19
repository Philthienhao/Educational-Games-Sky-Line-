import React, { useState } from 'react';
import { Plane, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

export function FlyingWordsGame({ questions, teams, onAddPoints }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentQ = questions[currentQIndex] || questions[0];

  // Split target sentence / options into flying word bubbles
  const targetWords = currentQ.question.split(' ');
  const shuffledWords = [...targetWords].sort(() => 0.5 - Math.random());

  const handleWordClick = (word, idx) => {
    if (isSuccess) return;
    const newWords = [...selectedWords, word];
    setSelectedWords(newWords);
    SoundFX.click();

    if (newWords.join(' ') === currentQ.question) {
      setIsSuccess(true);
      SoundFX.fanfare();
      confetti({ particleCount: 90, spread: 80 });
      onAddPoints(0, 200);
    }
  };

  const handleClear = () => {
    setSelectedWords([]);
    setIsSuccess(false);
  };

  const handleNextSentence = () => {
    setSelectedWords([]);
    setIsSuccess(false);
    setCurrentQIndex(prev => (prev + 1) % questions.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '10px 20px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            ✈️ Từ Ngữ Biết Bay - Ghép Từ Thành Câu
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bắt các đám mây từ đang bay để xếp thành câu hoàn chỉnh đúng cú pháp.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleClear}>
          <RotateCcw size={16} /> Xóa Chọn
        </button>
      </div>

      {/* Target Construction Banner */}
      <div className="glass-panel" style={{
        width: '100%',
        padding: '24px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
        border: '1.5px solid #a78bfa',
        minHeight: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {selectedWords.length > 0 ? (
          selectedWords.map((w, idx) => (
            <span 
              key={idx}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                background: '#8b5cf6',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
              }}
            >
              {w}
            </span>
          ))
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Bắt các từ đang bay bên dưới để xếp câu tại đây...
          </span>
        )}
      </div>

      {isSuccess && (
        <div style={{ padding: '16px 24px', borderRadius: '16px', background: 'rgba(16,185,129,0.2)', border: '1.5px solid #10b981', color: '#6ee7b7', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>🎉 CHÍNH XÁC! BẠN ĐÃ BẮT VÀ GHÉP THÀNH CÔNG CÂU TỪ NỔI TIẾNG! (+200 ĐIỂM)</span>
          <button className="btn btn-primary" onClick={handleNextSentence}>
            Câu Tiếp Theo ✈️
          </button>
        </div>
      )}

      {/* Flying Sky Word Cloud */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        border: '2px solid rgba(255,255,255,0.15)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        padding: '30px'
      }}>
        {shuffledWords.map((word, idx) => (
          <button
            key={idx}
            onClick={() => handleWordClick(word, idx)}
            style={{
              padding: '14px 22px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              border: '2px solid #ddd6fe',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            className="animate-pulse-glow"
          >
            ☁️ {word}
          </button>
        ))}
      </div>

    </div>
  );
}
