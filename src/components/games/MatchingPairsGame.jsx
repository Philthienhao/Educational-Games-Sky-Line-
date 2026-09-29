import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, CheckCircle2, RotateCcw, Sparkles, ArrowLeft, Upload, FileSpreadsheet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { parseUploadedFile } from '../../utils/universalParser';

export function MatchingPairsGame({ questions: propQuestions, teams, onAddPoints, onClose }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [customQuestions, setCustomQuestions] = useState(null);

  const defaultQs = [
    { question: 'Thủ đô Việt Nam', options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'], correct: 'A' },
    { question: 'Hành tinh Đỏ', options: ['Sao Hỏa', 'Sao Kim', 'Sao Thủy', 'Sao Mộc'], correct: 'A' },
    { question: 'Đơn vị cường độ dòng điện', options: ['Ampe (A)', 'Vôn (V)', 'Ohm (Ω)', 'Watt (W)'], correct: 'A' },
    { question: 'Tác giả Truyện Kiều', options: ['Nguyễn Du', 'Nguyễn Trãi', 'Nam Cao', 'Tố Hữu'], correct: 'A' }
  ];

  const safeQuestions = customQuestions || (Array.isArray(propQuestions) && propQuestions.length > 0 ? propQuestions : defaultQs);

  const pairs = safeQuestions.slice(0, 8).map((q, idx) => ({
    id: idx,
    term: q?.question || `Khái niệm ${idx + 1}`,
    definition: (q?.options && Array.isArray(q.options) && q.options[0]) ? q.options[0] : `Đáp án ${idx + 1}`
  }));

  const [selectedTerm, setSelectedTerm] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [shuffledDefs, setShuffledDefs] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    setShuffledDefs([...pairs.map(p => ({ id: p.id, def: p.definition }))].sort(() => 0.5 - Math.random()));
    setMatchedPairs([]);
    setSelectedTerm(null);
  }, [customQuestions, propQuestions]);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCustomQuestions(parsed);
        try { SoundFX.correct(); } catch(e) {}
        alert(`Đã nhập thành công ${parsed.length} câu hỏi từ tệp ${file.name}!`);
      }
    } catch(err) {
      alert(err.message || 'Lỗi khi nhập tệp câu hỏi.');
    }
  };

  const handleSelectTerm = (pair) => {
    if (matchedPairs.includes(pair.id)) return;
    setSelectedTerm(pair);
    try { SoundFX.click(); } catch(e) {}
  };

  const handleSelectDef = (defObj) => {
    if (!selectedTerm) return;

    if (selectedTerm.id === defObj.id) {
      setMatchedPairs(prev => [...prev, selectedTerm.id]);
      setSelectedTerm(null);
      try { SoundFX.correct(); } catch(e) {}
      try { confetti({ particleCount: 60, spread: 50 }); } catch(e) {}
      if (onAddPoints) onAddPoints(0, 100);
    } else {
      try { SoundFX.wrong(); } catch(e) {}
      setSelectedTerm(null);
    }
  };

  const handleReset = () => {
    setMatchedPairs([]);
    setSelectedTerm(null);
    setShuffledDefs([...pairs.map(p => ({ id: p.id, def: p.definition }))].sort(() => 0.5 - Math.random()));
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
      gap: '24px',
      padding: '24px 36px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '14px', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)', fontWeight: 800 }}
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              🔗 Kéo Thả Nối Ý - Ghép Cặp Khái Niệm
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
              Bấm chọn vế bên trái (Cột A), sau đó chọn vế tương ứng bên phải (Cột B) để nối cặp.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', borderRadius: '14px', padding: '8px 14px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #0284c7', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} /> Tải câu hỏi (Excel/Word)
            <input type="file" accept=".xlsx,.xls,.docx,.doc,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button className="btn btn-secondary btn-sm" onClick={handleReset} style={{ borderRadius: '14px', padding: '8px 14px' }}>
            <RotateCcw size={16} /> Đặt Lại Nối Ý
          </button>
        </div>
      </div>

      {/* Two Columns Match Arena */}
      {!isGameStarted ? (
        <StartGameOverlay
          title="Nối Cặp Khái Niệm"
          icon="🔗"
          onStart={() => setIsGameStarted(true)}
        />
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', maxWidth: '1100px' }}>
        
        {/* Column A (Terms / Questions) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b', textAlign: 'center' }}>
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
                    ? '#dcfce7' 
                    : (isSelected ? '#fef3c7' : '#ffffff'),
                  border: isMatched 
                    ? '2.5px solid #16a34a' 
                    : (isSelected ? '2.5px solid #d97706' : '2.5px solid #cbd5e1'),
                  color: isMatched ? '#14532d' : (isSelected ? '#92400e' : '#0f172a'),
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  cursor: isMatched ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ color: 'inherit', fontWeight: 900 }}>{p.term}</span>
                {isMatched ? <span className="badge badge-custom" style={{ background: '#16a34a', color: '#fff', fontWeight: 900 }}>✓ ĐÃ NỐI</span> : (isSelected ? '👉 ĐANG CHỌN' : '+')}
              </div>
            );
          })}
        </div>

        {/* Column B (Definitions / Answers) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0284c7', textAlign: 'center' }}>
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
                  background: isMatched 
                    ? '#dcfce7' 
                    : '#ffffff',
                  border: isMatched ? '2.5px solid #16a34a' : '2.5px solid #cbd5e1',
                  color: isMatched ? '#1e3a8a' : '#0f172a',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  cursor: isMatched ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ color: 'inherit', fontWeight: 900 }}>{dObj.def}</span>
                {isMatched ? <span className="badge badge-custom" style={{ background: '#16a34a', color: '#fff', fontWeight: 900 }}>✓ ĐÃ NỐI</span> : '+ Nối vào'}
              </div>
            );
          })}
        </div>

      </div>
      )}

      {matchedPairs.length > 0 && matchedPairs.length === pairs.length && (
        <div style={{ padding: '16px 24px', borderRadius: '16px', background: 'rgba(16,185,129,0.2)', border: '1.5px solid #10b981', color: '#6ee7b7', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
          🎉 XUẤT SẮC! BẠN ĐÃ NỐI ĐÚNG TOÀN BỘ CÁC CẶP NỘI DUNG! (+400 ĐIỂM)
        </div>
      )}

    </div>,
    document.body
  );
}
