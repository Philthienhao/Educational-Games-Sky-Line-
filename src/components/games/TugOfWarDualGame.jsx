import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Maximize, RotateCcw, Trophy, Settings, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { isOptionValidForQuestion } from '../../utils/universalParser';

export function TugOfWarDualGame({ questions, teams, onAddPoints }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  // Configurable Match Timer (default 90 seconds)
  const [matchDuration, setMatchDuration] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  const [soundMuted, setSoundMuted] = useState(false);

  // Rope Position (-100 = Full Left Blue Wins, 0 = Center, +100 = Full Right Red Wins)
  const [ropePosition, setRopePosition] = useState(0); 

  // Find team matching color blue/red or fallback to index
  const blueTeamObj = (teams && teams.find(t => t.color === '#3b82f6' || t.name.includes('Xanh'))) || (teams && teams[1]) || (teams && teams[0]) || { name: 'Đội Xanh (Đội 2)', score: 0 };
  const redTeamObj = (teams && teams.find(t => t.color === '#ef4444' || t.name.includes('Đỏ'))) || (teams && teams[0]) || { name: 'Đội Đỏ (Đội 1)', score: 0 };

  const blueTeamIndex = teams ? teams.findIndex(t => t.id === blueTeamObj?.id) : 1;
  const redTeamIndex = teams ? teams.findIndex(t => t.id === redTeamObj?.id) : 0;

  // Custom editable team names inside the game UI
  const [customBlueName, setCustomBlueName] = useState(blueTeamObj?.name || 'Đội Xanh');
  const [customRedName, setCustomRedName] = useState(redTeamObj?.name || 'Đội Đỏ');

  const blueTeamName = customBlueName || 'Đội Xanh';
  const redTeamName = customRedName || 'Đội Đỏ';
  const blueTeamScore = blueTeamObj?.score || 0;
  const redTeamScore = redTeamObj?.score || 0;

  // Question lists for each team (shuffled independently)
  const safeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : [
    {
      question: 'Việt Nam nằm ở khu vực nào của Châu Á?',
      options: ['Đông Á', 'Đông Nam Á', 'Nam Á', 'Tây Nam Á'],
      correct: 'B'
    }
  ];

  const totalQuestionsCount = Math.max(1, safeQuestions.length);
  // Calculate dynamic pull step percentage per question count (10 câu -> 10%/câu, 20 câu -> 5%/câu, N câu -> 100/N %/câu)
  const pullStepPercent = 100 / totalQuestionsCount;

  const [blueQuestions, setBlueQuestions] = useState(() => [...safeQuestions].sort(() => 0.5 - Math.random()));
  const [redQuestions, setRedQuestions] = useState(() => [...safeQuestions].sort(() => 0.5 - Math.random()));

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      setBlueQuestions([...questions].sort(() => 0.5 - Math.random()));
      setRedQuestions([...questions].sort(() => 0.5 - Math.random()));
      setBlueIndex(0);
      setRedIndex(0);
      setBlueAnswerState(null);
      setRedAnswerState(null);
      setBlueSelected(null);
      setRedSelected(null);
    }
  }, [questions]);

  const [blueIndex, setBlueIndex] = useState(0);
  const [redIndex, setRedIndex] = useState(0);

  const [blueAnswerState, setBlueAnswerState] = useState(null); // 'correct' | 'wrong' | null
  const [redAnswerState, setRedAnswerState] = useState(null);

  const [blueSelected, setBlueSelected] = useState(null);
  const [redSelected, setRedSelected] = useState(null);

  const [winner, setWinner] = useState(null); // 'blue' | 'red' | 'draw' | null

  const fireworksIntervalRef = useRef(null);

  const currentBlueQ = blueQuestions[blueIndex % blueQuestions.length] || safeQuestions[0];
  const currentRedQ = redQuestions[redIndex % redQuestions.length] || safeQuestions[0];

  // Continuous Fireworks Cannon when a team wins
  const triggerFireworks = () => {
    if (fireworksIntervalRef.current) clearInterval(fireworksIntervalRef.current);
    
    // Initial big burst
    try { confetti({ particleCount: 150, spread: 120, origin: { y: 0.5 } }); } catch(e) {}

    // Repeated side cannons for 5 seconds
    const duration = 5000;
    const animationEnd = Date.now() + duration;

    fireworksIntervalRef.current = setInterval(() => {
      const remainingTime = animationEnd - Date.now();
      if (remainingTime <= 0) {
        return clearInterval(fireworksIntervalRef.current);
      }
      try {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 65,
          origin: { x: 0.05, y: 0.65 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 65,
          origin: { x: 0.95, y: 0.65 }
        });
      } catch(e) {}
    }, 300);
  };

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning || winner) return;
    if (timeLeft <= 0) {
      // Time is up -> declare winner based on rope position
      if (ropePosition < -5) {
        setWinner('blue');
        if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
        triggerFireworks();
      } else if (ropePosition > 5) {
        setWinner('red');
        if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
        triggerFireworks();
      } else {
        setWinner('draw');
        if (!soundMuted) try { SoundFX.correct(); } catch(e) {}
      }
      setIsTimerRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, winner, ropePosition, soundMuted]);

  // Handle Blue Team Answer
  const handleBlueAnswer = (optLabel) => {
    if (blueAnswerState || winner) return;
    setBlueSelected(optLabel);

    const isCorrect = optLabel === currentBlueQ.correct;

    if (isCorrect) {
      setBlueAnswerState('correct');
      if (!soundMuted) try { SoundFX.correct(); } catch(e) {}
      if (onAddPoints) onAddPoints(blueTeamIndex >= 0 ? blueTeamIndex : 1, 100);

      // Dynamic Pull rope left towards Blue (-pullStepPercent%)
      const newPos = Math.max(-100, ropePosition - pullStepPercent);
      setRopePosition(newPos);

      if (newPos <= -100) {
        setWinner('blue');
        setIsTimerRunning(false);
        if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
        triggerFireworks();
      }
    } else {
      setBlueAnswerState('wrong');
      if (!soundMuted) try { SoundFX.wrong(); } catch(e) {}
    }

    setTimeout(() => {
      setBlueAnswerState(null);
      setBlueSelected(null);
      setBlueIndex(prev => (prev + 1) % blueQuestions.length);
    }, 1000);
  };

  // Handle Red Team Answer
  const handleRedAnswer = (optLabel) => {
    if (redAnswerState || winner) return;
    setRedSelected(optLabel);

    const isCorrect = optLabel === currentRedQ.correct;

    if (isCorrect) {
      setRedAnswerState('correct');
      if (!soundMuted) try { SoundFX.correct(); } catch(e) {}
      if (onAddPoints) onAddPoints(redTeamIndex >= 0 ? redTeamIndex : 0, 100);

      // Dynamic Pull rope right towards Red (+pullStepPercent%)
      const newPos = Math.min(100, ropePosition + pullStepPercent);
      setRopePosition(newPos);

      if (newPos >= 100) {
        setWinner('red');
        setIsTimerRunning(false);
        if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
        triggerFireworks();
      }
    } else {
      setRedAnswerState('wrong');
      if (!soundMuted) try { SoundFX.wrong(); } catch(e) {}
    }

    setTimeout(() => {
      setRedAnswerState(null);
      setRedSelected(null);
      setRedIndex(prev => (prev + 1) % redQuestions.length);
    }, 1000);
  };

  // COMPLETE RESET GAME FUNCTION
  const handleResetGame = () => {
    if (fireworksIntervalRef.current) clearInterval(fireworksIntervalRef.current);
    setRopePosition(0);
    setTimeLeft(matchDuration);
    setIsTimerRunning(true);
    setWinner(null);
    setBlueIndex(0);
    setRedIndex(0);
    setBlueAnswerState(null);
    setRedAnswerState(null);
    setBlueSelected(null);
    setRedSelected(null);
    setBlueQuestions([...safeQuestions].sort(() => 0.5 - Math.random()));
    setRedQuestions([...safeQuestions].sort(() => 0.5 - Math.random()));
  };

  // Change duration setting
  const handleChangeDuration = (seconds) => {
    setMatchDuration(seconds);
    setTimeLeft(seconds);
    setShowTimerSettings(false);
    handleResetGame();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      minHeight: '640px',
      background: '#0d1322',
      color: '#fff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      {/* TOP HEADER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#080d19',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        {/* Left Game Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#facc15', margin: 0, textShadow: '0 2px 8px rgba(250, 204, 21, 0.3)' }}>
            🪢 Kéo Co Kiến Thức
          </h2>
        </div>

        {/* Center Clock Timer with Duration Adjuster */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '0px',
          background: '#020617',
          padding: '6px 20px 8px 20px',
          borderRadius: '0 0 20px 20px',
          border: '2px solid rgba(255,255,255,0.2)',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '1.1rem', fontWeight: 900 }}>
              ⏰ <span style={{ fontSize: '1.6rem', color: timeLeft <= 15 ? '#ef4444' : '#fff' }}>{formatTime(timeLeft)}</span>
            </div>
            
            <button
              onClick={() => setShowTimerSettings(!showTimerSettings)}
              title="Cài đặt thời gian trận đấu"
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Time Preset Dropdown Menu */}
          {showTimerSettings && (
            <div style={{
              position: 'absolute',
              top: '55px',
              background: '#1e293b',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              width: '160px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>ĐẶT THỜI GIAN CHƠI:</span>
              {[
                { label: '60 Giây (1:00)', sec: 60 },
                { label: '90 Giây (1:30)', sec: 90 },
                { label: '120 Giây (2:00)', sec: 120 },
                { label: '180 Giây (3:00)', sec: 180 },
                { label: '300 Giây (5:00)', sec: 300 }
              ].map(item => (
                <button
                  key={item.sec}
                  onClick={() => handleChangeDuration(item.sec)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: matchDuration === item.sec ? '#2563eb' : 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls & Editable Team Scores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Blue Team Editable Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            padding: '4px 14px',
            borderRadius: '20px',
            border: '1.5px solid #60a5fa',
            fontWeight: 800,
            fontSize: '0.92rem'
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }} />
            <input 
              type="text"
              value={customBlueName}
              onChange={(e) => setCustomBlueName(e.target.value)}
              title="Đổi tên Đội Xanh"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 900,
                outline: 'none',
                width: '95px',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ fontSize: '1.15rem', color: '#facc15', marginLeft: '2px' }}>{blueTeamScore}đ</span>
          </div>

          {/* Red Team Editable Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #881337 0%, #dc2626 100%)',
            padding: '4px 14px',
            borderRadius: '20px',
            border: '1.5px solid #fca5a5',
            fontWeight: 800,
            fontSize: '0.92rem'
          }}>
            <span style={{ fontSize: '1.15rem', color: '#facc15', marginRight: '2px' }}>{redTeamScore}đ</span>
            <input 
              type="text"
              value={customRedName}
              onChange={(e) => setCustomRedName(e.target.value)}
              title="Đổi tên Đội Đỏ"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 900,
                outline: 'none',
                width: '95px',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fca5a5' }} />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {soundMuted ? 'Bật Âm' : 'Tắt Âm'}
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetGame}
            style={{ padding: '8px 12px', borderRadius: '10px', background: '#2563eb', border: '1px solid #60a5fa', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}
          >
            <RotateCcw size={16} /> Chơi Lại
          </button>
        </div>
      </div>

      {/* WINNER OVERLAY WITH FIREWORKS & REACTION */}
      {winner && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(12px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <Trophy size={85} color="#facc15" className="animate-bounce" style={{ filter: 'drop-shadow(0 0 25px #facc15)' }} />
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: winner === 'blue' ? '#60a5fa' : (winner === 'red' ? '#fca5a5' : '#facc15'), textShadow: '0 4px 20px rgba(0,0,0,0.8)', textAlign: 'center' }}>
            {winner === 'blue' ? `🎉 ${blueTeamName.toUpperCase()} CHIẾN THẮNG KÉO CO!` : (winner === 'red' ? `🎉 ${redTeamName.toUpperCase()} CHIẾN THẮNG KÉO CO!` : '🤝 HÒA NHAU KỊCH TÍNH!')}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', margin: '16px 0' }}>
            {/* Blue Reaction */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4.5rem', transform: winner === 'blue' ? 'scale(1.2)' : 'scale(0.9)', transition: 'all 0.4s ease' }}>
                {winner === 'blue' ? '🥳 🙌 🏃‍♂️' : (winner === 'red' ? '😭 🥀 🙇‍♂️' : '😐')}
              </div>
              <div style={{ marginTop: '8px', fontWeight: 800, color: '#60a5fa', fontSize: '1.1rem' }}>
                {blueTeamName}: {winner === 'blue' ? 'VUI SƯỚNG NHẢY MÚA! 🥳' : 'Ủ RŨ BUỒN RẦU 😭'}
              </div>
            </div>

            {/* Red Reaction */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4.5rem', transform: winner === 'red' ? 'scale(1.2)' : 'scale(0.9)', transition: 'all 0.4s ease' }}>
                {winner === 'red' ? '🥳 🙌 🏃‍♀️' : (winner === 'blue' ? '😭 🥀 🙇‍♀️' : '😐')}
              </div>
              <div style={{ marginTop: '8px', fontWeight: 800, color: '#fca5a5', fontSize: '1.1rem' }}>
                {redTeamName}: {winner === 'red' ? 'VUI SƯỚNG NHẢY MÚA! 🥳' : 'Ủ RŨ BUỒN RẦU 😭'}
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleResetGame} style={{ marginTop: '12px', fontSize: '1.2rem', padding: '14px 36px', borderRadius: '18px' }}>
            <RotateCcw size={22} /> Ván Mới Ngay
          </button>
        </div>
      )}

      {/* MAIN 3-COLUMN PLAYING ARENA */}
      {!isGameStarted ? (
        <StartGameOverlay
          title="Kéo Co 2 Đội Đối Kháng"
          icon="⚔️"
          onStart={() => {
            setIsGameStarted(true);
            setIsTimerRunning(true);
          }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr 340px',
          gap: '16px',
          flex: 1,
          padding: '16px',
          alignItems: 'stretch'
        }}>

        {/* LEFT COLUMN: BLUE TEAM QUESTION BOX */}
        <div style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          border: '2.5px solid #2563eb',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 900, color: '#60a5fa', fontSize: '1.05rem' }}>
              🔵 {blueTeamName}
            </span>
            <span style={{ fontSize: '0.75rem', background: '#1e3a8a', padding: '2px 8px', borderRadius: '8px', color: '#93c5fd', fontWeight: 800 }}>
              Câu #{blueIndex + 1}
            </span>
          </div>

          {/* Question Box */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
            minHeight: '120px'
          }}>
            {currentBlueQ.image && (
              <img 
                src={currentBlueQ.image} 
                alt="Illustration" 
                style={{ maxHeight: '110px', borderRadius: '10px', marginBottom: '10px', objectFit: 'contain' }}
              />
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', lineHeight: 1.4, margin: 0 }}>
              {currentBlueQ.question}
            </h3>
          </div>

          {/* 4 Options Buttons 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['A', 'B', 'C', 'D'].map((label, idx) => {
              if (!isOptionValidForQuestion(currentBlueQ?.options, idx)) return null;
              const optText = currentBlueQ.options[idx];
              const isSelected = blueSelected === label;
              const isCorrect = currentBlueQ.correct === label;

              let btnBg = '#ffffff';
              let btnColor = '#0f172a';
              let borderColor = '#cbd5e1';

              if (blueAnswerState) {
                if (isCorrect) {
                  btnBg = '#10b981';
                  btnColor = '#ffffff';
                  borderColor = '#059669';
                } else if (isSelected && !isCorrect) {
                  btnBg = '#ef4444';
                  btnColor = '#ffffff';
                  borderColor = '#dc2626';
                }
              }

              return (
                <button
                  key={label}
                  onClick={() => handleBlueAnswer(label)}
                  disabled={!!blueAnswerState}
                  style={{
                    padding: '14px 10px',
                    borderRadius: '14px',
                    background: btnBg,
                    color: btnColor,
                    border: `2px solid ${borderColor}`,
                    fontWeight: 900,
                    fontSize: '1rem',
                    cursor: blueAnswerState ? 'default' : 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.15s ease',
                    minHeight: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}
                >
                  {optText}
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: REALISTIC TUG OF WAR FIELD WITH REAL STUDENT ILLUSTRATIONS */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '2px solid rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.06)'
        }}>

          {/* Bright Green Dashed Centerline - High Visibility Continuous */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '6px',
            background: 'repeating-linear-gradient(to bottom, #16a34a 0px, #16a34a 18px, transparent 18px, transparent 32px)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />

          {/* DYNAMIC SHIFTING ASSEMBLY: REALISTIC BLUE TEAM + REAL ROPE + RED RIBBON + REAL RED TEAM */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateX(${ropePosition * 1.6}px)`, // Dynamic horizontal pulling shift
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 2
          }}>

            {/* LEFT SIDE: BLUE TEAM */}
            <div style={{
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              right: '-12px',
              transform: winner === 'blue' ? 'translateY(-15px) scale(1.05)' : (winner === 'red' ? 'translateY(15px) rotate(-8deg)' : 'none'),
              transition: 'all 0.5s ease'
            }}>
              <img 
                src="/assets/blue_team_pulling_rope.png?v=2" 
                alt="Blue Team Pulling Rope"
                style={{
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'scaleX(-1)', // Flipped to face center red ribbon bow
                  filter: 'drop-shadow(0 6px 12px rgba(37,99,235,0.15))'
                }} 
              />
            </div>

            {/* REALISTIC HEMP ROPE WITH BRIGHT RED RIBBON BOW IN CENTER */}
            <div style={{
              width: '110px',
              height: '14px',
              background: 'linear-gradient(180deg, #d97706 0%, #b45309 50%, #78350f 100%)',
              borderRadius: '7px',
              border: '2px solid #78350f',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
              margin: '0 -8px',
              zIndex: 5
            }}>
              {/* Bright Red Ribbon Bow Ribbon */}
              <div style={{
                width: '32px',
                height: '42px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '8px',
                border: '2.5px solid #991b1b',
                boxShadow: '0 6px 14px rgba(239, 68, 68, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 900
              }}>
                🎀
              </div>
            </div>

            {/* RIGHT SIDE: RED TEAM */}
            <div style={{
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              left: '-12px',
              transform: winner === 'red' ? 'translateY(-15px) scale(1.05)' : (winner === 'blue' ? 'translateY(15px) rotate(8deg)' : 'none'),
              transition: 'all 0.5s ease'
            }}>
              <img 
                src="/assets/red_team_pulling_rope.png?v=2" 
                alt="Red Team Pulling Rope"
                style={{
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'scaleX(-1)', // Flipped to face center red ribbon bow
                  filter: 'drop-shadow(0 6px 12px rgba(220,38,38,0.15))'
                }} 
              />
            </div>

          </div>

          {/* Live Tug Status Badge with Question Count Percentage Calculation */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '6px 18px',
            borderRadius: '20px',
            color: '#fff',
            fontSize: '0.82rem',
            fontWeight: 800,
            backdropFilter: 'blur(6px)',
            border: '1.5px solid rgba(94, 234, 212, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}>
            <div>
              {ropePosition < 0 ? `⬅️ ${blueTeamName} đang kéo mạnh (${Math.abs(Math.round(ropePosition))}%)` : (ropePosition > 0 ? `${redTeamName} đang kéo mạnh (+${Math.round(ropePosition)}%) ➡️` : '⚖️ Đang cân bằng ở vạch giữa')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#5eead4', fontWeight: 700 }}>
              📊 Tỷ lệ kéo: {pullStepPercent.toFixed(1)}%/1 câu đúng ({totalQuestionsCount} câu)
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RED TEAM QUESTION BOX */}
        <div style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          border: '2.5px solid #dc2626',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 900, color: '#fca5a5', fontSize: '1.05rem' }}>
              🔴 {redTeamName}
            </span>
            <span style={{ fontSize: '0.75rem', background: '#881337', padding: '2px 8px', borderRadius: '8px', color: '#fca5a5', fontWeight: 800 }}>
              Câu #{redIndex + 1}
            </span>
          </div>

          {/* Question Box */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
            minHeight: '120px'
          }}>
            {currentRedQ.image && (
              <img 
                src={currentRedQ.image} 
                alt="Illustration" 
                style={{ maxHeight: '110px', borderRadius: '10px', marginBottom: '10px', objectFit: 'contain' }}
              />
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', lineHeight: 1.4, margin: 0 }}>
              {currentRedQ.question}
            </h3>
          </div>

          {/* 4 Options Buttons 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['A', 'B', 'C', 'D'].map((label, idx) => {
              if (!isOptionValidForQuestion(currentRedQ?.options, idx)) return null;
              const optText = currentRedQ.options[idx];
              const isSelected = redSelected === label;
              const isCorrect = currentRedQ.correct === label;

              let btnBg = '#ffffff';
              let btnColor = '#0f172a';
              let borderColor = '#cbd5e1';

              if (redAnswerState) {
                if (isCorrect) {
                  btnBg = '#10b981';
                  btnColor = '#ffffff';
                  borderColor = '#059669';
                } else if (isSelected && !isCorrect) {
                  btnBg = '#ef4444';
                  btnColor = '#ffffff';
                  borderColor = '#dc2626';
                }
              }

              return (
                <button
                  key={label}
                  onClick={() => handleRedAnswer(label)}
                  disabled={!!redAnswerState}
                  style={{
                    padding: '14px 10px',
                    borderRadius: '14px',
                    background: btnBg,
                    color: btnColor,
                    border: `2px solid ${borderColor}`,
                    fontWeight: 900,
                    fontSize: '1rem',
                    cursor: redAnswerState ? 'default' : 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.15s ease',
                    minHeight: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}
                >
                  {optText}
                </button>
              );
            })}
          </div>
        </div>

      </div>
      )}

    </div>
  );
}
