import React, { useState, useEffect } from 'react';
import { Link, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';

export function MatchingPairsGame({ questions, teams, onAddPoints }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const pairs = questions.slice(0, 4).map((q, idx) => ({
    id: idx,
    term: q.question,
    definition: q.options[0] // Correct pairing
  }));

  const [selectedTerm, setSelectedTerm] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [shuffledDefs] = useState([...pairs.map(p => ({ id: p.id, def: p.definition }))].sort(() => 0.5 - Math.random()));
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (!isGameStarted || matchedPairs.length === pairs.length) return;
    setTimeLeft(20);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setSelectedTerm(null);
          try { SoundFX.wrong(); } catch(e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameStarted, selectedTerm, matchedPairs.length]);

  const handleSelectTerm = (pair) => {
    if (matchedPairs.includes(pair.id)) return;
    setSelectedTerm(pair);
    SoundFX.click();
  };

  const handleSelectDef = (defObj) => {
    if (!selectedTerm) return;

    if (selectedTerm.id === defObj.id) {
      // Correct Match
      setMatchedPairs([...matchedPairs, selectedTerm.id]);
      setSelectedTerm(null);
      SoundFX.correct();
      confetti({ particleCount: 60, spread: 50 });
      onAddPoints(0, 100);
    } else {
      // Wrong Match
      SoundFX.wrong();
      setSelectedTerm(null);
    }
  };

  const handleReset = () => {
    setMatchedPairs([]);
    setSelectedTerm(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '10px 20px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🔗 Kéo Thả Nối Ý - Ghép Cặp Khái Niệm
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bấm chọn vế bên trái (Cột A), sau đó chọn vế tương ứng bên phải (Cột B) để nối cặp.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleReset}>
          <RotateCcw size={16} /> Đặt Lại Nối Ý
        </button>
      </div>

      {/* Two Columns Match Arena */}
      {!isGameStarted ? (
        <StartGameOverlay
          title="Nối Cặp Khái Niệm"
          icon="🔗"
          onStart={() => setIsGameStarted(true)}
        />
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
        
        {/* Column A (Terms / Questions) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b', textAlign: 'center' }}>
            📌 CỘT A (KHÁI NIỆM / CÂU HỎI)
          </h3>
          {pairs.map((p) => {
            const isMatched = matchedPairs.includes(p.id);
            const isSelected = selectedTerm?.id === p.id;

            return (
              <div
                key={p.id}
                onClick={() => handleSelectTerm(p)}
                style={{
                  padding: '18px 20px',
                  borderRadius: '16px',
                  background: isMatched 
                    ? 'rgba(16, 185, 129, 0.18)' 
                    : (isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)'),
                  border: isMatched 
                    ? '2px solid #10b981' 
                    : (isSelected ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)'),
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: isMatched ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{p.term}</span>
                {isMatched ? <span className="badge badge-custom">✓ ĐÃ NỐI</span> : (isSelected ? '👉 ĐANG CHỌN' : '+')}
              </div>
            );
          })}
        </div>

        {/* Column B (Definitions / Answers) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#60a5fa', textAlign: 'center' }}>
            💡 CỘT B (GIẢI THÍCH / ĐÁP ÁN)
          </h3>
          {shuffledDefs.map((dObj) => {
            const isMatched = matchedPairs.includes(dObj.id);

            return (
              <div
                key={dObj.id}
                onClick={() => handleSelectDef(dObj)}
                style={{
                  padding: '18px 20px',
                  borderRadius: '16px',
                  background: isMatched ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                  border: isMatched ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: isMatched ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{dObj.def}</span>
                {isMatched ? <span className="badge badge-custom">✓ ĐÃ NỐI</span> : '+ Nối vào'}
              </div>
            );
          })}
        </div>

      </div>
      )}

      {matchedPairs.length === pairs.length && (
        <div style={{ padding: '16px 24px', borderRadius: '16px', background: 'rgba(16,185,129,0.2)', border: '1.5px solid #10b981', color: '#6ee7b7', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center', width: '100%' }}>
          🎉 XUẤT SẮC! BẠN ĐÃ NỐI ĐÚNG TOÀN BỘ CÁC CẶP NỘI DUNG! (+400 ĐIỂM)
        </div>
      )}

    </div>
  );
}
