import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

export function KnowledgeTrainGame({ questions, teams, onAddPoints }) {
  const sampleItems = questions.slice(0, 5).map((q, idx) => ({
    id: idx + 1,
    text: `${idx + 1}. ${q.question}`,
    correctIndex: idx
  }));

  const [trainCars, setTrainCars] = useState([]);
  const [availableCars, setAvailableCars] = useState(sampleItems.sort(() => 0.5 - Math.random()));
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectCar = (item) => {
    if (isCompleted) return;
    setTrainCars([...trainCars, item]);
    setAvailableCars(availableCars.filter(c => c.id !== item.id));
    SoundFX.click();

    // Check completion
    const newTrain = [...trainCars, item];
    if (newTrain.length === sampleItems.length) {
      let isCorrectOrder = true;
      newTrain.forEach((car, idx) => {
        if (car.correctIndex !== idx) isCorrectOrder = false;
      });

      if (isCorrectOrder) {
        setIsCompleted(true);
        SoundFX.fanfare();
        confetti({ particleCount: 90, spread: 80 });
        onAddPoints(0, 500);
      } else {
        SoundFX.wrong();
      }
    }
  };

  const handleReset = () => {
    setTrainCars([]);
    setAvailableCars(sampleItems.sort(() => 0.5 - Math.random()));
    setIsCompleted(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', padding: '20px', maxWidth: '950px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            🚂 Đoàn Tàu Tri Thức - Gắn Toa Theo Thứ Tự
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bấm chọn các toa tàu đố vui theo đúng thứ tự logic từ câu 1 đến câu 5 để thông quan đoàn tàu.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleReset}>
          <RotateCcw size={18} /> Đặt Lại Tàu
        </button>
      </div>

      {/* Train Locomotive & Connected Cars Track */}
      <div className="glass-panel" style={{ width: '100%', padding: '32px', display: 'flex', alignItems: 'center', gap: '14px', overflowX: 'auto', border: '2px solid rgba(255,255,255,0.15)' }}>
        
        {/* Locomotive Head */}
        <div style={{
          padding: '20px 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 900,
          fontSize: '1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 25px rgba(239,68,68,0.4)',
          flexShrink: 0
        }}>
          🚂 ĐẦU TÀU
        </div>

        {/* Attached Cars */}
        {trainCars.map((car, idx) => (
          <div
            key={car.id}
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1.5px solid #93c5fd',
              flexShrink: 0,
              maxWidth: '240px'
            }}
          >
            <span style={{ fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px' }}>
              Toa #{idx + 1}
            </span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {car.text}
            </span>
          </div>
        ))}

        {trainCars.length < sampleItems.length && (
          <div style={{ padding: '16px 24px', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.2)', color: 'var(--text-muted)', fontSize: '0.85rem', flexShrink: 0 }}>
            + Chọn toa tiếp theo
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div style={{ padding: '20px 28px', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', border: '1.5px solid #10b981', color: '#6ee7b7', fontWeight: 800, fontSize: '1.2rem', textAlign: 'center', width: '100%' }}>
          🎉 XUẤT SẮC! BẠN ĐÃ XẾP ĐÚNG TOÀN BỘ ĐOÀN TÀU TRI THỨC (+500 ĐIỂM)!
        </div>
      )}

      {/* Available Car Palette to Pick */}
      <div style={{ width: '100%' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '14px' }}>
          Toa Tàu Sẵn Có Trong Ga:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {availableCars.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectCar(item)}
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{item.text}</span>
              <span className="badge badge-teacher">+ Ghép</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
