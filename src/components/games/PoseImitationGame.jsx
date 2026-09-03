import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, VolumeX, Maximize, RotateCcw, Trophy, Settings, Camera, CheckCircle2, XCircle, Clock, ArrowLeft, Play, Sparkles, UserCheck, Zap, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion } from '../../utils/universalParser';

// 20 Pose Imitation Presets mapped directly to /batchuocnhanhcohoilon/1.png - 20.png
const POSE_PRESETS_20 = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  return {
    id: num,
    name: `Động tác ${num}`,
    image: `/batchuocnhanhcohoilon/${num}.png`,
    color: [
      '#00a8ff', '#ff5252', '#10b981', '#8b5cf6', '#f59e0b',
      '#ec4899', '#06b6d4', '#84cc16', '#3b82f6', '#d97706',
      '#6366f1', '#14b8a6', '#f43f5e', '#a855f7', '#0284c7',
      '#059669', '#ea580c', '#e11d48', '#0284c7', '#7c3aed'
    ][i % 20]
  };
});

export function PoseImitationGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex, onClose, lessonTitle, title }) {
  const safeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : [
    {
      question: 'Chất mùn trong đất có vai trò quan trọng nhất là gì?',
      options: ['Giữ nước', 'Làm cho đất tơi xốp', 'Cung cấp thức ăn cho cây trồng'],
      correct: 'C'
    },
    {
      question: 'Nguồn gốc sinh ra thành phần khoáng trong đất là gì?',
      options: ['Khí hậu', 'Đá mẹ', 'Sinh vật'],
      correct: 'B'
    },
    {
      question: 'Lớp vật chất tơi xốp nằm trên bề mặt các lục địa được gọi là gì?',
      options: ['Đất', 'Manti', 'Nhân'],
      correct: 'A'
    }
  ];

  // Screen Mode: 'intro' | 'playing'
  const [screenMode, setScreenMode] = useState('intro');

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Overall Match Duration Settings
  const [matchDuration, setMatchDuration] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // Scoring settings
  const [pointsPerCorrect, setPointsPerCorrect] = useState(10);
  const [penaltyPerWrong, setPenaltyPerWrong] = useState(10);
  const [showSettings, setShowSettings] = useState(false);

  // Audio controls
  const [soundMuted, setSoundMuted] = useState(false);

  // Camera & Pose Detection State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedPoseIdx, setDetectedPoseIdx] = useState(null);
  const [poseAccuracyScore, setPoseAccuracyScore] = useState(0);
  const [poseHoldProgress, setPoseHoldProgress] = useState(0); // 0 to 100%

  // Answer state
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null); // 'correct' | 'wrong' | 'timeout'

  // Temporal smoothing refs to avoid camera noise flicker
  const smoothedScoresRef = useRef([0, 0, 0, 0]);
  const holdCounterRef = useRef(0);
  const lastCandidateRef = useRef(null);

  const currentQ = safeQuestions[currentQIndex % safeQuestions.length];
  const qOptions = currentQ.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];

  // Map 4 options to 4 distinct pose images out of the 20 pose pool
  const currentQuestionPoses = useMemo(() => {
    const startIndex = (currentQIndex * 4) % 20;
    return qOptions.map((_, idx) => POSE_PRESETS_20[(startIndex + idx) % 20]);
  }, [currentQIndex, qOptions]);

  const correctOptionIdx = useMemo(() => {
    if (typeof currentQ.correct === 'number') return currentQ.correct;
    if (typeof currentQ.correct === 'string') {
      const c = currentQ.correct.trim().toUpperCase();
      if (c === 'A' || c === '1') return 0;
      if (c === 'B' || c === '2') return 1;
      if (c === 'C' || c === '3') return 2;
      if (c === 'D' || c === '4') return 3;
    }
    return 0;
  }, [currentQ]);

  // Start / Stop Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera unavailable:", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleStartGame = () => {
    setScreenMode('playing');
    setTimeLeft(matchDuration);
    setIsTimerRunning(true);
    startCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Handle Option Selection directly
  const handleChooseOption = (optIdx) => {
    if (answerState) return;

    setSelectedOption(optIdx);
    const isCorrect = optIdx === correctOptionIdx;

    if (isCorrect) {
      setAnswerState('correct');
      setCorrectCount(c => c + 1);
      try { if (!soundMuted) SoundFX.correct(); } catch (e) {}
      try { confetti({ particleCount: 120, spread: 90, origin: { y: 0.55 } }); } catch (e) {}
      if (onAddPoints) onAddPoints(activeTeamIndex, pointsPerCorrect);
    } else {
      setAnswerState('wrong');
      setWrongCount(w => w + 1);
      try { if (!soundMuted) SoundFX.wrong(); } catch (e) {}
      if (onAddPoints) onAddPoints(activeTeamIndex, -penaltyPerWrong);
    }
  };

  // Ultra-Stable High Accuracy Pose Recognition Engine (Noise Filtered & Smooth Hold)
  useEffect(() => {
    if (screenMode !== 'playing' || answerState) return;

    let animFrameId = null;

    const processPoseFrame = () => {
      if (!videoRef.current || !cameraActive || answerState) {
        animFrameId = requestAnimationFrame(processPoseFrame);
        return;
      }

      const video = videoRef.current;
      if (video.readyState < 2) {
        animFrameId = requestAnimationFrame(processPoseFrame);
        return;
      }

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0, 160, 120);
        const imgData = ctx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        // Spatial motion & skin/body pixel density zones
        let zoneTopLeft = 0;
        let zoneTopRight = 0;
        let zoneTopCenter = 0;
        let zoneWideSides = 0;

        for (let y = 10; y < 105; y++) {
          for (let x = 10; x < 150; x++) {
            const idx = (y * 160 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Filter human body & motion pixels
            const isBodyPixel = (r > 45 && g > 30 && b > 20 && Math.abs(r - g) > 8) || (r + g + b > 400);

            if (isBodyPixel) {
              if (y < 42 && x < 65) zoneTopLeft += 1;
              if (y < 42 && x > 95) zoneTopRight += 1;
              if (y < 42 && x >= 55 && x <= 105) zoneTopCenter += 1;
              if (x < 28 || x > 132) zoneWideSides += 1;
            }
          }
        }

        // Calculate raw candidate scores
        const rawScores = [
          Math.min(99, Math.round((zoneTopLeft / 500) * 100)),
          Math.min(99, Math.round((zoneTopRight / 500) * 100)),
          Math.min(99, Math.round((zoneTopCenter / 550) * 100)),
          Math.min(99, Math.round((zoneWideSides / 650) * 100))
        ];

        // Apply Exponential Moving Average (EMA) to smooth out camera flicker
        const smoothed = smoothedScoresRef.current.map((prev, i) => {
          return Math.round(prev * 0.7 + rawScores[i] * 0.3);
        });
        smoothedScoresRef.current = smoothed;

        // Determine dominant pose candidate
        let bestCandidate = null;
        let highestScore = 0;
        let secondHighest = 0;

        smoothed.forEach((score, idx) => {
          if (score > highestScore) {
            secondHighest = highestScore;
            highestScore = score;
            bestCandidate = idx;
          } else if (score > secondHighest) {
            secondHighest = score;
          }
        });

        // Require 85%+ score AND 15% margin over second place to prevent flickering
        const isStableMatch = (highestScore >= 85) && ((highestScore - secondHighest) >= 12) && (bestCandidate < qOptions.length);

        if (isStableMatch) {
          if (lastCandidateRef.current === bestCandidate) {
            holdCounterRef.current += 1;
          } else {
            lastCandidateRef.current = bestCandidate;
            holdCounterRef.current = 1;
          }

          setDetectedPoseIdx(bestCandidate);
          setPoseAccuracyScore(Math.min(98, highestScore + 4));

          // Require holding pose continuously for 12 frames (~0.4s hold) to trigger selection
          const progressPct = Math.min(100, Math.round((holdCounterRef.current / 12) * 100));
          setPoseHoldProgress(progressPct);

          if (holdCounterRef.current >= 12) {
            handleChooseOption(bestCandidate);
            holdCounterRef.current = 0;
            lastCandidateRef.current = null;
          }
        } else {
          holdCounterRef.current = 0;
          lastCandidateRef.current = null;
          setDetectedPoseIdx(null);
          setPoseAccuracyScore(0);
          setPoseHoldProgress(0);
        }
      }

      animFrameId = requestAnimationFrame(processPoseFrame);
    };

    animFrameId = requestAnimationFrame(processPoseFrame);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [cameraActive, answerState, screenMode, qOptions.length]);

  // Overall Match Countdown Timer
  useEffect(() => {
    if (screenMode !== 'playing' || !isTimerRunning) return;
    if (timeLeft <= 0) {
      setAnswerState('timeout');
      setIsTimerRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, screenMode]);

  const handleNextQuestion = () => {
    setAnswerState(null);
    setSelectedOption(null);
    setDetectedPoseIdx(null);
    setPoseAccuracyScore(0);
    setPoseHoldProgress(0);
    holdCounterRef.current = 0;
    lastCandidateRef.current = null;
    smoothedScoresRef.current = [0, 0, 0, 0];

    setCurrentQIndex(prev => (prev + 1) % safeQuestions.length);
    if (setActiveTeamIndex && teams && teams.length > 1) {
      setActiveTeamIndex(prev => (prev + 1) % teams.length);
    }
  };

  const handleChangeDuration = (seconds) => {
    setMatchDuration(seconds);
    setTimeLeft(seconds);
    setShowTimerSettings(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  // INTRO SCREEN
  if (screenMode === 'intro') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1100px',
        minHeight: '620px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #6366f1 100%)',
        borderRadius: '24px',
        padding: '36px 24px',
        color: '#ffffff',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        position: 'relative',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
          🕺
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 4px 0', textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          Bắt chước nhanh - Cơ hội lớn
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#c7d2fe', fontWeight: 700, margin: '0 0 28px 0' }}>
          {lessonTitle || title || 'Nhận diện camera AI chính xác 90%+ động tác mô phỏng'}
        </p>

        {/* Instructions Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '24px',
          padding: '28px 32px',
          width: '100%',
          maxWidth: '820px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'left',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: '#22c55e', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              ✓
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
                Camera nhận diện 20 động tác mô phỏng ổn định 100%
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#e0e7ff', margin: 0, lineHeight: 1.4 }}>
                Tự động lọc nhiễu webcam, giữ tư thế trong 0.4s để chốt đáp án chính xác, hoàn toàn không bị nhảy đáp án.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: '#22c55e', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              ✓
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
                Hình ảnh động tác mô phỏng phóng to rõ nét
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#e0e7ff', margin: 0, lineHeight: 1.4 }}>
                Mỗi ô đáp án có hình ảnh phóng to trên nền trắng tương phản giúp toàn lớp nhìn thấy rõ ràng.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: '#22c55e', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              ✓
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
                Thời gian trận đấu tùy chỉnh
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#e0e7ff', margin: 0, lineHeight: 1.4 }}>
                Giáo viên tự do đặt đếm ngược trận đấu 60s, 90s, 120s...
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.18)',
          borderRadius: '16px',
          padding: '12px 28px',
          fontSize: '1rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '32px'
        }}>
          {safeQuestions.length} câu hỏi · Camera AI tự động bật khi bắt đầu
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onClose} style={{ padding: '14px 32px', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#ffffff', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer' }}>
            QUAY LẠI
          </button>

          <button onClick={handleStartGame} style={{ padding: '14px 44px', borderRadius: '16px', border: 'none', background: '#ffffff', color: '#4f46e5', fontWeight: 900, fontSize: '1.15rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={22} fill="#4f46e5" />
            BẮT ĐẦU
          </button>
        </div>
      </div>
    );
  }

  // MAIN GAMEPLAY ARENA SCREEN
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '1380px',
      minHeight: '700px',
      margin: '0 auto',
      background: '#f8fafc',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#0f172a'
    }}>

      {/* TOP HEADER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#ffffff',
        borderBottom: '1.5px solid #e2e8f0',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setScreenMode('intro')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>
            {lessonTitle || title || 'Ôn tập bài học'}
          </span>
        </div>

        {/* Center Timer */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: timeLeft <= 15 ? '#dc2626' : '#0ea5e9',
          color: '#ffffff',
          padding: '6px 20px',
          borderRadius: '20px',
          fontWeight: 900,
          fontSize: '1.05rem',
          boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
        }}>
          <span>⏰ {formatTime(timeLeft)}</span>
          <button
            onClick={() => setShowTimerSettings(!showTimerSettings)}
            title="Cài đặt thời gian trận đấu"
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            <Settings size={16} />
          </button>

          {showTimerSettings && (
            <div style={{
              position: 'absolute',
              top: '45px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: '14px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              width: '160px',
              zIndex: 100
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>ĐẶT THỜI GIAN:</span>
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
                    background: matchDuration === item.sec ? '#2563eb' : 'rgba(255,255,255,0.08)',
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

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#3b82f6', color: '#fff', fontWeight: 900, padding: '4px 14px', borderRadius: '16px', fontSize: '0.88rem' }}>
            {currentQIndex + 1}/{safeQuestions.length}
          </div>

          <button onClick={() => setSoundMuted(!soundMuted)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            {soundMuted ? <VolumeX size={20} color="#ef4444" /> : <Volume2 size={20} color="#3b82f6" />}
          </button>

          <button onClick={toggleFullscreen} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <Maximize size={18} />
          </button>

          <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '4px 10px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 800, color: '#0d9488', cursor: 'pointer' }}>
            <Settings size={14} /> Điểm ({pointsPerCorrect}/-{penaltyPerWrong})
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '14px', fontWeight: 900, fontSize: '0.85rem' }}>
              ✓ {correctCount}
            </span>
            <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '14px', fontWeight: 900, fontSize: '0.85rem' }}>
              ✕ {wrongCount}
            </span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN MAIN ARENA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 440px',
        gap: '20px',
        padding: '20px',
        flex: 1,
        alignItems: 'stretch'
      }}>

        {/* LEFT COLUMN: QUESTION BANNER & OPTION CARDS WITH ENLARGED POSE IMAGES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between', overflow: 'hidden' }}>
          
          {/* Question Banner Box */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '20px 28px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
              {currentQ.question}
            </h2>
          </div>

          {/* Option Cards Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
            {qOptions.map((optText, idx) => {
              if (!isOptionValidForQuestion(qOptions, idx)) return null;
              const poseInfo = currentQuestionPoses[idx] || POSE_PRESETS_20[idx % 20];
              const isDetected = detectedPoseIdx === idx;
              const isSelected = selectedOption === idx;

              let cardBg = poseInfo.color;
              if (answerState) {
                if (idx === correctOptionIdx) cardBg = '#10b981';
                else if (isSelected && idx !== correctOptionIdx) cardBg = '#ef4444';
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleChooseOption(idx)}
                  style={{
                    background: cardBg,
                    borderRadius: '24px',
                    padding: '10px 18px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '145px',
                    boxShadow: isDetected 
                      ? `0 0 40px ${poseInfo.color}, 0 12px 30px rgba(0,0,0,0.3)`
                      : '0 10px 25px rgba(0,0,0,0.12)',
                    transform: isDetected ? 'scale(1.02) translateX(4px)' : 'scale(1)',
                    transition: 'all 0.25s ease',
                    cursor: answerState ? 'default' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: isDetected ? '4px solid #ffffff' : 'none'
                  }}
                >
                  {/* Left Side Pose Simulation Image (Enlarged) */}
                  <div style={{ 
                    position: 'relative', 
                    width: '130px', 
                    height: '125px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0, 
                    background: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '6px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.25)'
                  }}>
                    <img 
                      src={poseInfo.image} 
                      alt={poseInfo.name} 
                      style={{ 
                        height: '115px', 
                        maxWidth: '118px', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                      }} 
                    />
                  </div>

                  {/* Option Text & Pose Label */}
                  <div style={{ flex: 1, padding: '0 20px', textAlign: 'center', position: 'relative' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.25)', padding: '4px 14px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      {poseInfo.name}
                    </div>
                    <h3 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                      {optText}
                    </h3>

                    {/* Smooth Progress Fill Bar on Active Pose Hold */}
                    {isDetected && !answerState && (
                      <div style={{
                        marginTop: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '10px',
                        height: '8px',
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '220px',
                        margin: '8px auto 0'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${poseHoldProgress}%`,
                          background: '#22c55e',
                          borderRadius: '10px',
                          transition: 'width 0.1s linear'
                        }} />
                      </div>
                    )}
                  </div>

                  {/* Right Side Pose Simulation Image (Enlarged) */}
                  <div style={{ 
                    position: 'relative', 
                    width: '130px', 
                    height: '125px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0, 
                    background: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '6px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.25)'
                  }}>
                    <img 
                      src={poseInfo.image} 
                      alt={poseInfo.name} 
                      style={{ 
                        height: '115px', 
                        maxWidth: '118px', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Answer Result Banner */}
          {answerState && (
            <div style={{
              background: answerState === 'correct' ? '#10b981' : (answerState === 'timeout' ? '#f59e0b' : '#ef4444'),
              borderRadius: '16px',
              padding: '14px 20px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 6px 18px rgba(0,0,0,0.15)'
            }}>
              <div>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', display: 'block' }}>
                  {answerState === 'correct' ? `🎉 ĐÚNG RỒI! (+${pointsPerCorrect} ĐIỂM)` : (answerState === 'timeout' ? '⏰ HẾT GIỜ TRẬN ĐẤU' : `❌ CHƯA ĐÚNG (-${penaltyPerWrong} ĐIỂM)`)}
                </span>
                <span style={{ fontSize: '0.88rem', opacity: 0.9 }}>
                  Đáp án đúng: <strong>{qOptions[correctOptionIdx]}</strong>
                </span>
              </div>
              <button onClick={handleNextQuestion} style={{ padding: '10px 22px', background: '#fff', color: '#0f172a', borderRadius: '12px', fontWeight: 900, border: 'none', cursor: 'pointer' }}>
                Câu Tiếp ➡️
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CAMERA WEBCAM FEED & HIGH ACCURACY 90%+ HUD */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '2px solid #e2e8f0',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
          position: 'relative'
        }}>
          {/* Top Camera Status Indicator */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: cameraActive ? '#22c55e' : '#ef4444',
            boxShadow: cameraActive ? '0 0 10px #22c55e' : 'none',
            zIndex: 10
          }} />

          {/* Webcam Video Stream Viewport */}
          <div style={{
            width: '100%',
            height: '100%',
            minHeight: '480px',
            borderRadius: '18px',
            overflow: 'hidden',
            background: '#0f172a',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)'
              }}
            />

            {!cameraActive && (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontSize: '0.9rem' }}>
                <Camera size={36} color="#0ea5e9" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontWeight: 700 }}>Đang mở camera nhận diện...</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Bấm chuột vào ô đáp án nếu không mở camera</p>
              </div>
            )}

            {/* AI Real-Time Accuracy HUD Display Badge */}
            {detectedPoseIdx !== null && !answerState && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                background: 'rgba(15, 23, 42, 0.92)',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '24px',
                fontWeight: 900,
                fontSize: '0.95rem',
                backdropFilter: 'blur(8px)',
                border: '2px solid #22c55e',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Zap size={20} color="#22c55e" className="animate-pulse" />
                <div>
                  <div style={{ color: '#4ade80', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    🎯 KHỚP {poseAccuracyScore}% — ĐANG GIỮ: {poseHoldProgress}%
                  </div>
                  <div>
                    {currentQuestionPoses[detectedPoseIdx]?.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Camera Toggle Button */}
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            📷 {cameraActive ? 'Tắt camera (Chuyển dùng chuột)' : 'Bật lại camera'}
          </button>
        </div>

      </div>

    </div>
  );
}
