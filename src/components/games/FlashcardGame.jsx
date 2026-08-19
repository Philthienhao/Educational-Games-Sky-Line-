import React, { useState } from 'react';
import { RotateCw, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

export function FlashcardGame({ questions, teams, onAddPoints }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState([]);

  const currentQ = questions[currentIndex % questions.length] || questions[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    SoundFX.click();
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % questions.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + questions.length) % questions.length);
  };

  const handleMarkMastered = () => {
    if (!masteredCards.includes(currentIndex)) {
      setMasteredCards([...masteredCards, currentIndex]);
      SoundFX.correct();
      confetti({ particleCount: 50, spread: 60 });
      onAddPoints(0, 50);
    }
    handleNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', padding: '20px', maxWidth: '750px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🎴 Thẻ Ghi Nhớ Flashcard - Ôn Tập Kiến Thức
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bấm vào thẻ để lật xem đáp án và lời giải chi tiết.
          </p>
        </div>

        <div className="badge badge-custom" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          ⭐ ĐÃ THUỘC: {masteredCards.length} / {questions.length} THẺ
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        style={{
          width: '100%',
          height: '340px',
          perspective: '1000px',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          
          {/* Front Side (Question) */}
          <div className="glass-panel" style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '2px solid rgba(139, 92, 246, 0.4)'
          }}>
            <span className="badge badge-teacher" style={{ position: 'absolute', top: '20px', left: '24px' }}>
              MẶT TRƯỚC: CÂU HỎI {currentIndex + 1}
            </span>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.4, margin: '20px 0' }}>
              {currentQ.question}
            </h3>

            <div style={{ position: 'absolute', bottom: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCw size={16} /> Bấm để lật xem đáp án
            </div>
          </div>

          {/* Back Side (Answer) */}
          <div className="glass-panel" style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.4)'
          }}>
            <span className="badge badge-custom" style={{ position: 'absolute', top: '20px', left: '24px' }}>
              MẶT SAU: ĐÁP ÁN ĐÚNG
            </span>

            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6ee7b7', marginBottom: '12px' }}>
              ĐÁP ÁN: ({currentQ.correct}) - {currentQ.options[['A','B','C','D'].indexOf(currentQ.correct)]}
            </div>

            {currentQ.explanation && (
              <p style={{ color: 'var(--text-bright)', fontSize: '0.95rem', maxWidth: '500px', lineHeight: 1.5 }}>
                💡 {currentQ.explanation}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={handlePrev}>
          <ChevronLeft size={20} /> Thẻ Trước
        </button>

        <button className="btn btn-success" onClick={handleMarkMastered}>
          <CheckCircle2 size={20} /> Đã Thuộc Thẻ Này (+50đ)
        </button>

        <button className="btn btn-secondary" onClick={handleNext}>
          Thẻ Sau <ChevronRight size={20} />
        </button>
      </div>

    </div>
  );
}
