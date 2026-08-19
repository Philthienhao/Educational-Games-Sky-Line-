import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, CheckCircle2, XCircle, Trophy, Settings, Edit3, X, Sparkles, HelpCircle, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

const SLICE_COLORS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
  '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9',
  '#06b6d4', '#14b8a6', '#10b981', '#84cc16',
  '#eab308', '#f59e0b', '#ef4444', '#14b8a6'
];

export function WheelOfFortuneGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex }) {
  const [selectedResult, setSelectedResult] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showWheelEditModal, setShowWheelEditModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null); // 'correct' | 'wrong'
  const [localTeam, setLocalTeam] = useState(0);
  
  const currentTeamIdx = setActiveTeamIndex !== undefined ? activeTeamIndex : localTeam;
  const setTurnTeam = (newIdx) => {
    if (setActiveTeamIndex) setActiveTeamIndex(newIdx);
    else setLocalTeam(newIdx);
  };

  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Customizable Wheel Slices state
  const [slices, setSlices] = useState([
    'Học sinh 01', 'Học sinh 02', 'Học sinh 03', 'Học sinh 04',
    'Học sinh 05', 'Học sinh 06', 'Học sinh 07', 'Học sinh 08',
    'May Mắn +50', 'Mất Lượt', 'Nhân Đôi Điểm', 'Học sinh 09'
  ]);

  const [slicesInputText, setSlicesInputText] = useState(slices.join('\n'));

  const canvasRef = useRef(null);
  const currentRotation = useRef(0);
  const isSpinning = useRef(false);

  // Draw wheel on canvas
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    const numSlices = slices.length;
    if (numSlices === 0) return;

    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation.current);

    slices.forEach((sliceText, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text on Slice
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      
      // Dynamic Font Size based on slice count & length
      const fontSize = Math.max(10, Math.min(15, 200 / numSlices));
      ctx.font = `bold ${fontSize}px Nunito, sans-serif`;
      ctx.fillText(sliceText, radius - 20, 5);
      ctx.restore();
    });

    ctx.restore();

    // Draw Center Peg Button
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUAY', centerX, centerY);

    // Draw Pointer Pin (Top)
    ctx.beginPath();
    ctx.moveTo(centerX - 16, centerY - radius - 12);
    ctx.lineTo(centerX + 16, centerY - radius - 12);
    ctx.lineTo(centerX, centerY - radius + 14);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel();
  }, [slices]);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t <= 5 && t > 1) SoundFX.timerTick();
          return t - 1;
        });
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      SoundFX.wrong();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Spin Wheel Function
  const spinWheel = () => {
    if (isSpinning.current || slices.length === 0) return;
    isSpinning.current = true;
    setSelectedOption(null);
    setAnswerState(null);

    const spinDuration = 4000;
    const start = performance.now();
    const extraRotations = (5 + Math.random() * 5) * 2 * Math.PI;
    const startRotation = currentRotation.current;
    const targetRotation = startRotation + extraRotations;

    let lastTickAngle = startRotation;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / spinDuration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentRotation.current = startRotation + (targetRotation - startRotation) * easeOut;

      // Play tick sound on slice crossing
      if (Math.abs(currentRotation.current - lastTickAngle) > (2 * Math.PI) / slices.length) {
        SoundFX.spinTick();
        lastTickAngle = currentRotation.current;
      }

      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning.current = false;
        
        // Calculate Winner Slice
        const numSlices = slices.length;
        const normalizedRot = (currentRotation.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer is at top (-PI/2)
        const pointerAngle = (3 * Math.PI / 2 - normalizedRot + 2 * Math.PI) % (2 * Math.PI);
        const winIndex = Math.floor(pointerAngle / ((2 * Math.PI) / numSlices)) % numSlices;
        
        const winner = slices[winIndex];
        setSelectedResult(winner);
        SoundFX.correct();
        
        // Open Question Modal
        setTimeout(() => {
          setShowQuestionModal(true);
          setTimer(30);
          setIsTimerRunning(true);
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleSelectOption = (optLabel) => {
    if (answerState) return;
    setSelectedOption(optLabel);
    setIsTimerRunning(false);

    const currentQ = questions[currentQIndex];
    if (optLabel === currentQ.correct) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onAddPoints(selectedTeam, 100);
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  const handleNextQuestion = () => {
    setShowQuestionModal(false);
    setSelectedOption(null);
    setAnswerState(null);
    setCurrentQIndex((prev) => (prev + 1) % questions.length);
  };

  // Wheel Customizer Handlers
  const handleSaveCustomSlices = () => {
    const lines = slicesInputText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (lines.length === 0) {
      alert('Vòng quay phải có ít nhất 1 ô nội dung.');
      return;
    }

    setSlices(lines);
    setShowWheelEditModal(false);
    SoundFX.correct();
  };

  const handlePresetTeams = () => {
    if (teams && teams.length > 0) {
      const teamNames = teams.map(t => t.name);
      setSlices(teamNames);
      setSlicesInputText(teamNames.join('\n'));
      setShowWheelEditModal(false);
      SoundFX.correct();
    }
  };

  const handlePresetStudents = () => {
    const studentList = Array.from({ length: 10 }, (_, i) => `Học sinh ${i + 1 < 10 ? '0' + (i + 1) : i + 1}`);
    setSlices(studentList);
    setSlicesInputText(studentList.join('\n'));
    setShowWheelEditModal(false);
    SoundFX.correct();
  };

  const handlePresetPrizes = () => {
    const prizes = ['+100 Điểm', 'Mất Lượt', 'Nhân Đôi Điểm', '+50 Điểm', 'May Mắn ⭐', 'Trả Lời Đố Vui', '+200 Điểm', 'Đổi Lượt'];
    setSlices(prizes);
    setSlicesInputText(prizes.join('\n'));
    setShowWheelEditModal(false);
    SoundFX.correct();
  };

  const currentQ = questions[currentQIndex] || questions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 20px', width: '100%' }}>
      
      {/* Controls Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '850px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-bright)' }}>
          🎯 Ô Vừa Quay Vào: <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>{selectedResult || 'Bấm QUAY VÒNG QUAY'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Edit Wheel Button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSlicesInputText(slices.join('\n'));
              setShowWheelEditModal(true);
            }}
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fde047', border: '1px solid #f59e0b' }}
          >
            <Edit3 size={16} /> Chỉnh Sửa Vòng Quay ({slices.length} ô)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cộng điểm cho:</span>
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(Number(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: '10px', background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700 }}
            >
              {teams.map((t, idx) => (
                <option key={idx} value={idx}>{t.name} ({t.score}đ)</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Wheel Canvas & Spin Button */}
      <div style={{ position: 'relative', width: '420px', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} width={420} height={420} style={{ filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.5))' }} />
      </div>

      <button 
        className="btn btn-accent btn-lg animate-pulse-glow"
        onClick={spinWheel}
        style={{ padding: '16px 40px', fontSize: '1.2rem', borderRadius: '30px' }}
      >
        <RotateCw size={24} />
        QUAY VÒNG QUAY MAY MẮN
      </button>

      {/* Modal 1: Wheel Customizer Modal */}
      {showWheelEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '580px', padding: '28px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 color="#f59e0b" size={22} />
                Chỉnh Sửa Nội Dung Vòng Quay
              </h3>
              <button onClick={() => setShowWheelEditModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Nhập tên đội chơi, tên học sinh hoặc bất kỳ nội dung nào bạn muốn xuất hiện trên vòng quay (Mỗi ô quay ghi trên một dòng):
            </p>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handlePresetTeams}
                style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c4b5fd', border: '1px solid #6366f1' }}
              >
                🎯 Theo Tên {teams.length} Đội Chơi
              </button>
              
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handlePresetStudents}
              >
                🎓 Học Sinh 1 - 10
              </button>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={handlePresetPrizes}
              >
                🎁 Mẫu Thưởng & Phạt
              </button>
            </div>

            <textarea 
              rows={8}
              value={slicesInputText}
              onChange={(e) => setSlicesInputText(e.target.value)}
              placeholder="Nhập tên ô vòng quay (Mỗi ô một dòng)..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowWheelEditModal(false)}
              >
                Hủy Bỏ
              </button>
              <button 
                className="btn btn-accent"
                onClick={handleSaveCustomSlices}
              >
                Cập Nhật Vòng Quay
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal 2: Question Popup Modal */}
      {showQuestionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '750px', padding: '32px' }}>
            
            {/* Header Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div className="badge badge-admin" style={{ background: '#8b5cf6', color: '#fff' }}>
                CÂU HỎI {currentQIndex + 1} / {questions.length}
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: timer <= 5 ? '#ef4444' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⏱️ {timer}s
              </div>
            </div>

            {/* Question Text */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '24px', lineHeight: 1.4 }}>
              {currentQ.question}
            </h2>

            {/* Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
                const optText = currentQ.options[idx];
                const isSelected = selectedOption === optLabel;
                const isCorrect = currentQ.correct === optLabel;

                let btnBg = 'rgba(255, 255, 255, 0.07)';
                let border = '1px solid rgba(255, 255, 255, 0.15)';

                if (answerState) {
                  if (isCorrect) {
                    btnBg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    border = '1.5px solid #6ee7b7';
                  } else if (isSelected && !isCorrect) {
                    btnBg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                    border = '1.5px solid #fca5a5';
                  }
                }

                return (
                  <button
                    key={optLabel}
                    onClick={() => handleSelectOption(optLabel)}
                    disabled={!!answerState}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: btnBg,
                      border: border,
                      color: '#fff',
                      textAlign: 'left',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: answerState ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900
                    }}>
                      {optLabel}
                    </span>
                    {optText}
                  </button>
                );
              })}
            </div>

            {/* Explanation Feedback */}
            {answerState && (
              <div style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: answerState === 'correct' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: answerState === 'correct' ? '1px solid #10b981' : '1px solid #ef4444',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5', fontSize: '1.1rem' }}>
                    {answerState === 'correct' ? `🎉 CHÍNH XÁC! (+100 ĐIỂM CHO ${teams[selectedTeam]?.name || 'ĐỘI'})` : `❌ CHƯA ĐÚNG! Đáp án đúng là (${currentQ.correct})`}
                  </div>
                  {currentQ.explanation && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      💡 Gợi ý: {currentQ.explanation}
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleNextQuestion}
                >
                  Câu Tiết Theo
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
