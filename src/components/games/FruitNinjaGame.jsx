import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

export function FruitNinjaGame({ questions, teams, onAddPoints }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [activeTeam, setActiveTeam] = useState(0);
  const [slashedItem, setSlashedItem] = useState(null);

  const currentQ = questions[currentQIndex] || questions[0];

  const fruitItems = [
    { label: 'A', text: currentQ.options[0], fruit: '🍉', color: '#ef4444', speed: 3 },
    { label: 'B', text: currentQ.options[1], fruit: '🍌', color: '#eab308', speed: 2.5 },
    { label: 'C', text: currentQ.options[2], fruit: '🍎', color: '#f43f5e', speed: 3.2 },
    { label: 'D', text: currentQ.options[3], fruit: '🍊', color: '#f97316', speed: 2.8 }
  ];

  const handleSlashFruit = (item) => {
    if (answerState) return;
    setSelectedOption(item.label);
    setSlashedItem(item.label);

    const isCorrect = item.label === currentQ.correct;
    if (isCorrect) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      onAddPoints(activeTeam, 100);
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setAnswerState(null);
    setSlashedItem(null);
    setCurrentQIndex(prev => (prev + 1) % questions.length);
    setActiveTeam(prev => (prev + 1) % teams.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 20px', width: '100%', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🍉 Chém Hoa Quả / Bắt Bong Bóng Quiz
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bấm/Chém trái cây mang đáp án đúng để ghi điểm cho đội của bạn!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lượt của:</span>
          <select 
            value={activeTeam} 
            onChange={(e) => setActiveTeam(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: '10px', background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700 }}
          >
            {teams.map((t, idx) => (
              <option key={idx} value={idx}>{t.name} ({t.score}đ)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel" style={{ width: '100%', padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)', border: '1.5px solid rgba(245, 158, 11, 0.4)' }}>
        <span className="badge badge-accent" style={{ marginBottom: '10px' }}>
          CÂU HỎI {currentQIndex + 1} / {questions.length}
        </span>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', lineHeight: 1.4 }}>
          {currentQ.question}
        </h3>
      </div>

      {/* Interactive Fruit Slash Arena */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '380px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
        border: '2px solid rgba(255,255,255,0.15)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        padding: '20px'
      }}>
        {fruitItems.map((item) => {
          const isSlashed = slashedItem === item.label;
          const isCorrect = currentQ.correct === item.label;

          let cardBg = 'rgba(255, 255, 255, 0.07)';
          let borderColor = 'rgba(255, 255, 255, 0.15)';

          if (answerState) {
            if (isCorrect) {
              cardBg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              borderColor = '#6ee7b7';
            } else if (isSlashed && !isCorrect) {
              cardBg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              borderColor = '#fca5a5';
            }
          }

          return (
            <div
              key={item.label}
              onClick={() => handleSlashFruit(item)}
              style={{
                borderRadius: '20px',
                background: cardBg,
                border: `2px solid ${borderColor}`,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: answerState ? 'default' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                transform: isSlashed ? 'scale(0.95) rotate(-2deg)' : 'scale(1)'
              }}
              className={!answerState ? 'animate-pulse-glow' : ''}
            >
              <div style={{
                fontSize: '3.2rem',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
                transition: 'all 0.3s ease',
                transform: isSlashed ? 'rotate(45deg) scale(1.2)' : 'none'
              }}>
                {item.fruit}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: item.color,
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                    BẤM / CHÉM NGAY
                  </span>
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                  {item.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer Feedback */}
      {answerState && (
        <div style={{
          width: '100%',
          padding: '16px 24px',
          borderRadius: '16px',
          background: answerState === 'correct' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
          border: answerState === 'correct' ? '1.5px solid #10b981' : '1.5px solid #ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5', fontSize: '1.1rem' }}>
              {answerState === 'correct' ? `⚔️ CHÉM TRÚNG QUẢ ĐÚNG! (+100 ĐIỂM CHO ${teams[activeTeam]?.name})` : `❌ CHÉM NHẦM QUẢ SAI! Đáp án đúng là (${currentQ.correct})`}
            </div>
            {currentQ.explanation && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                💡 {currentQ.explanation}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleNextQuestion}>
            Trái Cây Tiết Theo 🍉
          </button>
        </div>
      )}

    </div>
  );
}
