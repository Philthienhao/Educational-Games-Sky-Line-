import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RotateCw, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, ArrowLeft, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { parseUploadedFile } from '../../utils/universalParser';

const DEFAULT_FLASHCARD_QUESTIONS = [
  { question: 'Thủ đô của Việt Nam là thành phố nào?', options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế'], correct: 'A' },
  { question: '2 + 2 x 3 = ?', options: ['8', '12', '10', '16'], correct: 'A' }
];

export function FlashcardGame({ questions: propQuestions = [], teams = [], onAddPoints, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState([]);
  const [customQuestions, setCustomQuestions] = useState(null);

  const safeQuestions = (Array.isArray(customQuestions) && customQuestions.length > 0)
    ? customQuestions
    : ((Array.isArray(propQuestions) && propQuestions.length > 0) ? propQuestions : DEFAULT_FLASHCARD_QUESTIONS);

  const currentQ = safeQuestions[currentIndex % safeQuestions.length] || safeQuestions[0];

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed && parsed.length > 0) {
        setCustomQuestions(parsed);
        setCurrentIndex(0);
        setMasteredCards([]);
        setIsFlipped(false);
        alert(`Đã nhập thành công ${parsed.length} câu hỏi vào Flashcard!`);
        SoundFX.correct();
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi tải tệp câu hỏi');
      SoundFX.wrong();
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    SoundFX.click();
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % safeQuestions.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + safeQuestions.length) % safeQuestions.length);
  };

  const handleMarkMastered = () => {
    if (!masteredCards.includes(currentIndex)) {
      setMasteredCards([...masteredCards, currentIndex]);
      SoundFX.correct();
      confetti({ particleCount: 50, spread: 60 });
      if (onAddPoints) onAddPoints(0, 50);
    }
    handleNext();
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999999,
      background: 'linear-gradient(135deg, #07121e 0%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '28px',
      padding: '24px 36px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onClose && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>
              🎴 Thẻ Ghi Nhớ Flashcard - Ôn Tập Kiến Thức
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Bấm vào thẻ để lật xem đáp án và lời giải chi tiết.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label className="btn btn-secondary btn-sm" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', cursor: 'pointer' }}>
            <Upload size={14} /> Nhập File Câu Hỏi
            <input type="file" accept=".xlsx,.xls,.docx,.doc,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <div className="badge badge-custom" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ⭐ ĐÃ THUỘC: {masteredCards.length} / {safeQuestions.length} THẺ
          </div>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        style={{
          width: '100%',
          height: '480px',
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
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: '2px solid #6366f1'
          }}>
            <span className="badge badge-teacher" style={{ position: 'absolute', top: '20px', left: '24px' }}>
              MẶT TRƯỚC: CÂU HỎI {currentIndex + 1}
            </span>

            <h3 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.4, margin: '20px 0', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {currentQ.question}
            </h3>

            <div style={{ position: 'absolute', bottom: '20px', color: '#c7d2fe', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            border: '2px solid #10b981'
          }}>
            <span className="badge badge-custom" style={{ position: 'absolute', top: '20px', left: '24px' }}>
              MẶT SAU: ĐÁP ÁN ĐÚNG
            </span>

            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fef08a', marginBottom: '12px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
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

    </div>,
    document.body
  );
}
