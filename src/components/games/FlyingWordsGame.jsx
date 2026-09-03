import React, { useState, useEffect } from 'react';
import { Plane, Sparkles, CheckCircle2, RotateCcw, Plus, Settings, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';

export function FlyingWordsGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const safeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : [
    {
      question: 'Học đi đôi với hành',
      options: ['Học đi đôi với hành', 'Học rèn luyện', 'Học vui vẻ', 'Học Chăm chỉ'],
      correct: 'A'
    }
  ];

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customSentenceInput, setCustomSentenceInput] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);
  const [activeSentence, setActiveSentence] = useState('');

  const currentQ = safeQuestions[currentQIndex % safeQuestions.length];

  // Helper to derive target sentence cleanly
  useEffect(() => {
    let target = '';
    if (currentQ) {
      if (currentQ.sentence) target = currentQ.sentence;
      else if (currentQ.targetSentence) target = currentQ.targetSentence;
      else if (currentQ.options && Array.isArray(currentQ.options)) {
        let idx = 0;
        if (typeof currentQ.correct === 'number') idx = currentQ.correct;
        else if (typeof currentQ.correct === 'string') {
          const char = currentQ.correct.trim().toUpperCase();
          if (['A','B','C','D'].includes(char)) idx = char.charCodeAt(0) - 65;
        }
        target = currentQ.options[idx] || currentQ.question;
      } else {
        target = currentQ.question;
      }
    }
    setActiveSentence(target || 'Học đi đôi với hành');
    setSelectedWords([]);
    setIsSuccess(false);
    setIsTimeout(false);
  }, [currentQIndex, currentQ]);

  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimeout, setIsTimeout] = useState(false);

  // Clean words array
  const cleanTargetWords = activeSentence.trim().split(/\s+/).filter(Boolean);

  useEffect(() => {
    if (!isGameStarted || isSuccess || isTimeout) return;
    setTimeLeft(20);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeout(true);
          setSelectedWords(cleanTargetWords);
          try { SoundFX.wrong(); } catch(e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQIndex, activeSentence, isSuccess, isTimeout]);
  
  // Shuffled word clouds pool
  const [wordPool, setWordPool] = useState([]);

  useEffect(() => {
    const distractors = ['thật', 'rất', 'luôn', 'vui'];
    const combined = [...cleanTargetWords, ...distractors.slice(0, Math.min(2, cleanTargetWords.length))];
    const shuffled = combined
      .map((w, i) => ({ id: `word_${i}_${Date.now()}`, text: w }))
      .sort(() => 0.5 - Math.random());
    setWordPool(shuffled);
  }, [activeSentence]);

  const handleSelectWord = (item) => {
    if (isSuccess) return;
    const nextWords = [...selectedWords, item.text];
    setSelectedWords(nextWords);
    setWordPool(prev => prev.filter(w => w.id !== item.id));
    try { SoundFX.click(); } catch(e) {}

    // Check sentence match
    const builtSentence = nextWords.join(' ').toLowerCase();
    const targetClean = cleanTargetWords.join(' ').toLowerCase();

    if (builtSentence === targetClean) {
      setIsSuccess(true);
      try { SoundFX.fanfare(); } catch(e) {}
      try { confetti({ particleCount: 100, spread: 90 }); } catch(e) {}
      if (onAddPoints) onAddPoints(activeTeamIndex, 200);
    }
  };

  const handleResetCurrentSentence = () => {
    setSelectedWords([]);
    setIsSuccess(false);
    const distractors = ['thật', 'rất', 'luôn', 'vui'];
    const combined = [...cleanTargetWords, ...distractors.slice(0, Math.min(2, cleanTargetWords.length))];
    const shuffled = combined
      .map((w, i) => ({ id: `word_${i}_${Date.now()}`, text: w }))
      .sort(() => 0.5 - Math.random());
    setWordPool(shuffled);
  };

  const handleNextSentence = () => {
    setSelectedWords([]);
    setIsSuccess(false);
    setCurrentQIndex(prev => (prev + 1) % safeQuestions.length);
    if (setActiveTeamIndex && teams && teams.length > 1) {
      setActiveTeamIndex(prev => (prev + 1) % teams.length);
    }
  };

  const handleApplyCustomSentence = () => {
    if (!customSentenceInput.trim()) {
      alert('Vui lòng nhập câu cần sắp xếp.');
      return;
    }
    setActiveSentence(customSentenceInput.trim());
    setShowInputModal(false);
    setCustomSentenceInput('');
    try { SoundFX.correct(); } catch(e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 20px', width: '100%', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* Dynamic Keyframes for Flying Clouds */}
      <style>{`
        @keyframes flyCloud1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-18px) translateX(10px); }
        }
        @keyframes flyCloud2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-26px) translateX(-12px); }
        }
        @keyframes flyCloud3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(15px); }
        }
      `}</style>

      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✈️ Từ Ngữ Biết Bay - Nhập Cầu Kiến Thức
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bắt các đám mây từ ngữ đang bay lơ lửng để ghép thành câu đúng cú pháp hoàn chỉnh!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isSuccess && !isTimeout && (
            <span style={{
              background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(2, 132, 199, 0.25)',
              border: `1.5px solid ${timeLeft <= 5 ? '#ef4444' : '#38bdf8'}`,
              color: timeLeft <= 5 ? '#fca5a5' : '#7dd3fc',
              fontWeight: 900,
              fontSize: '0.85rem',
              padding: '6px 14px',
              borderRadius: '10px'
            }}>
              ⏱️ {timeLeft}s
            </span>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowInputModal(true)} style={{ background: 'rgba(167, 139, 250, 0.2)', border: '1px solid #a78bfa', color: '#c4b5fd' }}>
            <Plus size={16} /> Cài Đặt Câu Nhanh
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleResetCurrentSentence}>
            <RotateCcw size={16} /> Đặt Lại Câu
          </button>
        </div>
      </div>

      {/* TARGET SENTENCE CONSTRUCTION LINE */}
      <div className="glass-panel" style={{
        width: '100%',
        padding: '24px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '2px solid #8b5cf6',
        minHeight: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 8px 30px rgba(139, 92, 246, 0.2)'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.05em' }}>
          📝 DÃY THI CÔNG NỐI CÂU THÀNH CÂU HOÀN CHỈNH:
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', minHeight: '48px' }}>
          {selectedWords.length > 0 ? (
            selectedWords.map((w, idx) => (
              <span
                key={idx}
                style={{
                  padding: '10px 20px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  border: '1px solid #ddd6fe',
                  animation: 'popIn 0.3s ease'
                }}
              >
                {w}
              </span>
            ))
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontStyle: 'italic' }}>
              ☁️ Bấm chọn các đám mây từ đang bay bên dưới để ghép câu tại đây...
            </span>
          )}
        </div>
      </div>

      {/* FLYING WORD CLOUDS SKY CANVAS */}
      {!isGameStarted ? (
        <StartGameOverlay
          title="Ghép Từ Bay Lơ Lửng"
          icon="☁️"
          onStart={() => setIsGameStarted(true)}
        />
      ) : (
        <>
          <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '320px',
        borderRadius: '24px',
        background: 'radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #090d16 100%)',
        border: '2px solid rgba(255,255,255,0.15)',
        overflow: 'hidden',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
      }}>
        {wordPool.map((item, idx) => {
          const animName = `flyCloud${(idx % 3) + 1}`;
          const animDuration = `${2.8 + (idx % 3) * 0.6}s`;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectWord(item)}
              disabled={isSuccess}
              style={{
                padding: '16px 28px',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(224, 231, 255, 0.9) 100%)',
                color: '#1e1b4b',
                fontWeight: 900,
                fontSize: '1.25rem',
                border: '3px solid #818cf8',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
                animation: `${animName} ${animDuration} infinite ease-in-out`,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ☁️ {item.text}
            </button>
          );
        })}
      </div>

      {/* SUCCESS OVERLAY & NEXT QUESTION CONTROL */}
      {isSuccess && (
        <div style={{
          width: '100%',
          padding: '20px 24px',
          borderRadius: '20px',
          background: 'rgba(16,185,129,0.2)',
          border: '2px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#6ee7b7' }}>
            🎉 HOÀN THÀNH XUẤT SẮC! BẠN ĐÃ GIẢI VÀ GHÉP ĐÚNG CÂU HOÀN CHỈNH (+200 ĐIỂM)!
          </div>
          <button className="btn btn-primary btn-md" onClick={handleNextSentence}>
            Câu Tiếp Theo ➔
          </button>
        </div>
      )}
        </>
      )}

      {/* QUICK CUSTOM SENTENCE INPUT MODAL */}
      {showInputModal && (
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
          <div className="glass-modal" style={{ width: '100%', maxWidth: '550px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              ✍️ Cài Đặt Câu Cần Sắp Xếp Trực Tiếp
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Nhập câu từ mong muốn (Ví dụ: "Học đi đôi với hành", "Cần cù bù thông minh"). Hệ thống sẽ tự động tách câu thành các đám mây từ ngữ bay lơ lửng cho học sinh ghép!
            </p>

            <textarea
              rows={3}
              value={customSentenceInput}
              onChange={(e) => setCustomSentenceInput(e.target.value)}
              placeholder="Nhập câu tại đây..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowInputModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleApplyCustomSentence}>
                Áp Dụng Ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
