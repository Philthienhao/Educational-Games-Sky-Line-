import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, VolumeX, Maximize, RotateCcw, Trophy, Settings, Camera, CheckCircle2, XCircle, Clock, ArrowLeft, HelpCircle, Users, Award, Edit3, Plus, Minus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';

export function HeadTiltGame({ questions, teams: initialTeams, setTeams, onAddPoints, onRenameTeam, activeTeamIndex = 0, setActiveTeamIndex, onClose }) {
  const safeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : [
    {
      question: 'Thủ đô của Nhật Bản là thành phố nào?',
      options: ['Osaka', 'Tokyo'],
      correct: 'B'
    },
    {
      question: 'Sông Níl dài nhất thế giới nằm ở châu lục nào?',
      options: ['Châu Phi', 'Châu Á'],
      correct: 'A'
    },
    {
      question: 'Số 17 là số nguyên tố hay hợp số?',
      options: ['Số nguyên tố', 'Hợp số'],
      correct: 'A'
    }
  ];

  const [isGameStarted, setIsGameStarted] = useState(false);

  // Local state for teams fallback if not managed globally
  const [localTeams, setLocalTeams] = useState(initialTeams && initialTeams.length > 0 ? initialTeams : [
    { name: 'Đội 1 (Đỏ)', points: 0, color: '#ef4444' },
    { name: 'Đội 2 (Xanh)', points: 0, color: '#3b82f6' },
    { name: 'Đội 3 (Vàng)', points: 0, color: '#eab308' },
    { name: 'Đội 4 (Lục)', points: 0, color: '#22c55e' }
  ]);

  const activeTeams = (initialTeams && initialTeams.length > 0) ? initialTeams : localTeams;

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Overall Match Duration Settings (default 90s match duration)
  const [matchDuration, setMatchDuration] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // Custom Teacher Scoring Settings (+10 correct, -10 wrong default)
  const [pointsPerCorrect, setPointsPerCorrect] = useState(10);
  const [penaltyPerWrong, setPenaltyPerWrong] = useState(10);
  const [showSettings, setShowSettings] = useState(false);

  // Team Management & Custom Score Modal
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Total Accumulated Score (Single & Team Modes)
  const [totalScore, setTotalScore] = useState(0);
  const [lastScoreEvent, setLastScoreEvent] = useState(null); // { delta: 10, teamName: 'Đội 1', type: 'add' | 'sub' }

  // Sound Controls
  const [soundMuted, setSoundMuted] = useState(false);

  // Camera & Head Tilt State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [tiltDirection, setTiltDirection] = useState('center'); // 'left' | 'right' | 'center'
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100%
  const [tiltSensitivity, setTiltSensitivity] = useState('high'); // 'high' | 'medium' | 'low'
  const [currentTiltAngleDeg, setCurrentTiltAngleDeg] = useState(0);

  // EMA Ref for Noise Elimination & Hold Tracking
  const smoothedOffsetRef = useRef(0);
  const baselineOffsetRef = useRef(0);
  const holdStartTimeRef = useRef(null);
  const activeTiltRef = useRef('center');

  // Answer selection state
  const [selectedOption, setSelectedOption] = useState(null); // 'A' or 'B'
  const [answerState, setAnswerState] = useState(null); // 'correct' | 'wrong' | 'timeout'

  const currentQ = safeQuestions[currentQIndex % safeQuestions.length];

  // Derive Left Option (A) & Right Option (B)
  const optionA = currentQ.options?.[0] || 'Đáp án A';
  const optionB = currentQ.options?.[1] || 'Đáp án B';
  const correctOptionKey = useMemo(() => {
    if (typeof currentQ.correct === 'string') {
      const trimmed = currentQ.correct.trim().toUpperCase();
      if (['A', 'B', '1', '2'].includes(trimmed)) {
        return (trimmed === 'A' || trimmed === '1') ? 'A' : 'B';
      }
    }
    return 'A';
  }, [currentQ]);

  const activeTeamName = (activeTeams && activeTeams[activeTeamIndex]) ? activeTeams[activeTeamIndex].name : `Lớp Học`;

  // Team Management Handlers
  const handleRenameTeamName = (index, newName) => {
    if (onRenameTeam) {
      onRenameTeam(index, newName);
    } else if (setTeams) {
      setTeams(prev => prev.map((t, i) => i === index ? { ...t, name: newName } : t));
    } else {
      setLocalTeams(prev => prev.map((t, i) => i === index ? { ...t, name: newName } : t));
    }
  };

  const handleAdjustTeamPoints = (index, delta) => {
    if (onAddPoints) {
      onAddPoints(index, delta);
    } else if (setTeams) {
      setTeams(prev => prev.map((t, i) => i === index ? { ...t, points: Math.max(0, (t.points || 0) + delta) } : t));
    } else {
      setLocalTeams(prev => prev.map((t, i) => i === index ? { ...t, points: Math.max(0, (t.points || 0) + delta) } : t));
    }
  };

  const handleSetExactTeamPoints = (index, points) => {
    const val = Math.max(0, points);
    if (setTeams) {
      setTeams(prev => prev.map((t, i) => i === index ? { ...t, points: val } : t));
    } else {
      setLocalTeams(prev => prev.map((t, i) => i === index ? { ...t, points: val } : t));
    }
  };

  const handleAddTeam = () => {
    const nextIdx = activeTeams.length + 1;
    const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899'];
    const newTeam = { name: `Đội ${nextIdx}`, points: 0, color: colors[nextIdx % colors.length] };

    if (setTeams) {
      setTeams([...activeTeams, newTeam]);
    } else {
      setLocalTeams([...activeTeams, newTeam]);
    }
  };

  const handleDeleteTeam = (index) => {
    if (activeTeams.length <= 1) {
      alert('Cần giữ lại ít nhất 1 đội chơi.');
      return;
    }
    const updated = activeTeams.filter((_, i) => i !== index);
    if (setTeams) {
      setTeams(updated);
    } else {
      setLocalTeams(updated);
    }
    if (activeTeamIndex >= updated.length && setActiveTeamIndex) {
      setActiveTeamIndex(0);
    }
  };

  // Start / Stop Web Camera
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
      console.warn("Camera access denied or unavailable:", err);
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

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Smooth Head Tilt Tracking with High Sensitivity Threshold (25px) and 1.2s Confirmation Delay
  useEffect(() => {
    let animFrameId = null;

    const processCameraFrame = () => {
      if (!videoRef.current || !cameraActive || answerState) {
        setHoldProgress(0);
        holdStartTimeRef.current = null;
        activeTiltRef.current = 'center';
        animFrameId = requestAnimationFrame(processCameraFrame);
        return;
      }

      const video = videoRef.current;
      if (video.readyState < 2) {
        animFrameId = requestAnimationFrame(processCameraFrame);
        return;
      }

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror canvas to match user's mirrored video view 1-to-1
        ctx.save();
        ctx.translate(160, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, 160, 120);
        ctx.restore();

        const imgData = ctx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        let skinCount = 0;
        let skinXSum = 0;
        let topSkinXSum = 0, topSkinCount = 0;
        let botSkinXSum = 0, botSkinCount = 0;

        for (let y = 15; y < 105; y++) {
          for (let x = 20; x < 140; x++) {
            const idx = (y * 160 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Precise, robust skin color filter:
            // Rejects white walls, grey whiteboards, green chalkboards, and white shirts 100%!
            // Human skin strictly requires: R > 50, R > G + 8, R > B + 12
            const isSkin = (r > 50) && (g > 30) && (r - g >= 8) && (r - b >= 12);

            if (isSkin) {
              skinCount++;
              skinXSum += x;

              if (y < 55) {
                topSkinXSum += x;
                topSkinCount++;
              } else {
                botSkinXSum += x;
                botSkinCount++;
              }
            }
          }
        }

        if (skinCount > 15) {
          const faceCenterX = skinXSum / skinCount;
          const topFaceX = topSkinCount > 0 ? topSkinXSum / topSkinCount : faceCenterX;
          const botFaceX = botSkinCount > 0 ? botSkinXSum / botSkinCount : faceCenterX;

          // 1. Angle Vector (Top of face vs Bottom of face)
          const angleTilt = topFaceX - botFaceX;

          // 2. Face Centroid Offset relative to center (80px)
          const centerOffset = faceCenterX - 80;

          // Combined Raw Tilt Score (Ultra-sensitive to even subtle 2-3 degree tilts)
          const rawScore = angleTilt * 1.4 + centerOffset * 0.8;

          // Auto-neutralize baseline when upright
          if (Math.abs(rawScore - baselineOffsetRef.current) < 3) {
            baselineOffsetRef.current = baselineOffsetRef.current * 0.9 + rawScore * 0.1;
          }

          const relativeTiltScore = rawScore - baselineOffsetRef.current;

          // Ultra-fast EMA filter (alpha = 0.5)
          smoothedOffsetRef.current = smoothedOffsetRef.current * 0.5 + relativeTiltScore * 0.5;
          const currentScore = smoothedOffsetRef.current;

          const deg = Math.round(currentScore * 1.8);
          setCurrentTiltAngleDeg(deg);

          // Threshold based on sensitivity setting: High (1.5), Medium (3.0), Low (5.0)
          const SENSITIVITY_THRESHOLD = tiltSensitivity === 'high' ? 1.5 : (tiltSensitivity === 'medium' ? 3.0 : 5.0);

          let detectedDir = 'center';
          // In mirrored canvas: Positive score = head leaning to screen LEFT (Option A)
          // Negative score = head leaning to screen RIGHT (Option B)
          if (currentScore > SENSITIVITY_THRESHOLD) {
            detectedDir = 'left';
          } else if (currentScore < -SENSITIVITY_THRESHOLD) {
            detectedDir = 'right';
          }

          setTiltDirection(detectedDir);

          // Track 1.0s (1000ms) Hold Timer for Instant Answer Confirmation
          const now = Date.now();
          if (detectedDir !== 'center') {
            if (activeTiltRef.current !== detectedDir) {
              activeTiltRef.current = detectedDir;
              holdStartTimeRef.current = now;
              setHoldProgress(0);
            } else {
              const elapsed = now - (holdStartTimeRef.current || now);
              const REQUIRED_HOLD_MS = 1000; // Exactly 1.0s hold delay
              const pct = Math.min(100, Math.floor((elapsed / REQUIRED_HOLD_MS) * 100));
              setHoldProgress(pct);

              if (pct >= 100 && !answerState) {
                if (detectedDir === 'left') {
                  handleChooseOption('A');
                } else if (detectedDir === 'right') {
                  handleChooseOption('B');
                }
              }
            }
          } else {
            activeTiltRef.current = 'center';
            holdStartTimeRef.current = null;
            setHoldProgress(0);
          }
        } else {
          setTiltDirection('center');
          activeTiltRef.current = 'center';
          holdStartTimeRef.current = null;
          setHoldProgress(0);
          setCurrentTiltAngleDeg(0);
        }
      }

      animFrameId = requestAnimationFrame(processCameraFrame);
    };

    animFrameId = requestAnimationFrame(processCameraFrame);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [cameraActive, answerState]);

  // Overall Match Timer Effect
  useEffect(() => {
    if (!isTimerRunning || answerState) return;
    if (timeLeft <= 0) {
      setAnswerState('timeout');
      setIsTimerRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, answerState]);

  // Handle Choose Option (A = Left, B = Right) with Automatic Score Calculation
  const handleChooseOption = (optKey) => {
    if (answerState) return;

    setSelectedOption(optKey);
    const isCorrect = optKey === correctOptionKey;

    if (isCorrect) {
      const addedPoints = pointsPerCorrect;
      setAnswerState('correct');
      setCorrectCount(c => c + 1);
      setTotalScore(prev => prev + addedPoints);
      setLastScoreEvent({ delta: addedPoints, teamName: activeTeamName, type: 'add' });

      try { if (!soundMuted) SoundFX.correct(); } catch (e) {}
      try { confetti({ particleCount: 120, spread: 90, origin: { y: 0.55 } }); } catch (e) {}

      // Automatically update global team points
      if (onAddPoints) {
        onAddPoints(activeTeamIndex, addedPoints);
      } else {
        handleAdjustTeamPoints(activeTeamIndex, addedPoints);
      }
    } else {
      const deductedPoints = penaltyPerWrong;
      setAnswerState('wrong');
      setWrongCount(w => w + 1);
      setTotalScore(prev => Math.max(0, prev - deductedPoints));
      setLastScoreEvent({ delta: deductedPoints, teamName: activeTeamName, type: 'sub' });

      try { if (!soundMuted) SoundFX.wrong(); } catch (e) {}

      // Automatically update global team points
      if (onAddPoints) {
        onAddPoints(activeTeamIndex, -deductedPoints);
      } else {
        handleAdjustTeamPoints(activeTeamIndex, -deductedPoints);
      }
    }
  };

  const handleNextQuestion = () => {
    setAnswerState(null);
    setSelectedOption(null);
    setTiltDirection('center');
    setHoldProgress(0);
    setLastScoreEvent(null);
    smoothedOffsetRef.current = 0;
    holdStartTimeRef.current = null;
    activeTiltRef.current = 'center';
    setCurrentQIndex(prev => (prev + 1) % safeQuestions.length);
    if (setActiveTeamIndex && activeTeams && activeTeams.length > 1) {
      setActiveTeamIndex(prev => (prev + 1) % activeTeams.length);
    }
  };

  // Change duration setting
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

  // Option background color logic:
  // Both default to BLUE. Correct answer turns GREEN. Selected wrong answer turns RED.
  const optionABg = answerState
    ? (correctOptionKey === 'A'
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' // Green for Correct
        : (selectedOption === 'A'
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' // Red for Selected Wrong
            : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)')) // Blue for Unselected
    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'; // Default Blue

  const optionBBg = answerState
    ? (correctOptionKey === 'B'
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' // Green for Correct
        : (selectedOption === 'B'
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' // Red for Selected Wrong
            : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)')) // Blue for Unselected
    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'; // Default Blue

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '1280px',
      minHeight: '680px',
      margin: '0 auto',
      background: 'linear-gradient(180deg, #e0f2fe 0%, #fef3c7 50%, #ffe4e6 100%)',
      borderRadius: '24px',
      padding: '16px 24px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
      position: 'relative',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#1e293b'
    }}>

      {/* TOP TEAMS SCOREBOARD & TURN INDICATOR BANNER WITH DIRECT INLINE EDITABLE INPUTS */}
      {activeTeams && activeTeams.length > 0 && (
        <div style={{
          width: '100%',
          background: '#ffffff',
          borderRadius: '18px',
          padding: '10px 18px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
          border: '1.5px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={18} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>
                BẢNG ĐIỂM CÁC ĐỘI:
              </span>
            </div>

            {/* OPTIONAL EXPANDED MODAL BUTTON */}
            <button
              onClick={() => setShowTeamModal(true)}
              title="Quản lý thêm/xóa đội chơi"
              style={{
                background: '#e0f2fe',
                border: '1px solid #7dd3fc',
                color: '#0369a1',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Settings size={13} /> Thêm/Xóa Đội
            </button>
          </div>

          {/* INLINE EDITABLE TEAM BADGES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {activeTeams.map((t, idx) => (
              <div
                key={idx}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '1rem' }}>🏆</span>

                {/* DIRECT INLINE EDITABLE TEAM NAME INPUT */}
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) => handleRenameTeamName(idx, e.target.value)}
                  placeholder={`Đội ${idx + 1}`}
                  title="Bấm vào đây để gõ/đổi tên đội trực tiếp"
                  style={{
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    width: '110px',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />

                {/* DIRECT INLINE EDITABLE SCORE INPUT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <input
                    type="number"
                    value={t.points !== undefined ? t.points : 0}
                    onChange={(e) => handleSetExactTeamPoints(idx, parseInt(e.target.value) || 0)}
                    title="Bấm vào đây để nhập/sửa điểm trực tiếp"
                    style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1.5px solid #38bdf8',
                      borderRadius: '8px',
                      padding: '3px 6px',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      width: '52px',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 900 }}>đ</span>
                </div>

                {/* QUICK ADJUSTMENT BUTTONS (+5, -5) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <button
                    onClick={() => handleAdjustTeamPoints(idx, 5)}
                    title="Cộng 5 điểm"
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    +5
                  </button>

                  <button
                    onClick={() => handleAdjustTeamPoints(idx, -5)}
                    title="Trừ 5 điểm"
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    -5
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        width: '100%',
        marginBottom: '16px',
        gap: '12px'
      }}>
        {/* Left: Question Index */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1rem',
            padding: '6px 18px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            whiteSpace: 'nowrap'
          }}>
            Câu {currentQIndex + 1}/{safeQuestions.length}
          </div>
        </div>

        {/* Center: Countdown Clock AND Prominent Big Score Badge Positioned Right Next To Each Other */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          {/* Countdown Clock Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: timeLeft <= 15 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: '24px',
            fontWeight: 900,
            fontSize: '1.15rem',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.35)',
            border: '2px solid rgba(255,255,255,0.4)',
            position: 'relative'
          }}>
            <span>⏰ {formatTime(timeLeft)}</span>
            <button
              onClick={() => setShowTimerSettings(!showTimerSettings)}
              title="Cài đặt thời gian trận đấu"
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <Settings size={18} />
            </button>

            {/* Time Preset Dropdown Menu */}
            {showTimerSettings && (
              <div style={{
                position: 'absolute',
                top: '50px',
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

          {/* BIG PROMINENT SCORE BADGE IN CENTER NEXT TO TIMER */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            padding: '8px 24px',
            borderRadius: '24px',
            fontWeight: 900,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)',
            border: '2px solid #fef08a',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap'
          }}>
            <Trophy size={22} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            <span>{totalScore} ĐIỂM</span>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '20px',
              padding: '6px 14px',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              whiteSpace: 'nowrap'
            }}
          >
            {soundMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#3b82f6" />}
            <span>Nhạc: {soundMuted ? 'TẮT' : 'BẬT'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toàn màn hình"
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              flexShrink: 0
            }}
          >
            <Maximize size={16} color="#475569" />
          </button>

          <button
            onClick={() => {
              setTiltSensitivity(prev => prev === 'high' ? 'medium' : (prev === 'medium' ? 'low' : 'high'));
            }}
            title="Bấm để chỉnh độ nhạy nghiêng đầu"
            style={{
              background: '#ffffff',
              border: '1.5px solid #0284c7',
              borderRadius: '20px',
              padding: '6px 14px',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Camera size={16} />
            <span>⚡ Độ Nhạy: {tiltSensitivity === 'high' ? '🔥 Siêu Nhạy (1.5°)' : (tiltSensitivity === 'medium' ? '⚖️ Vừa (3.0°)' : '🎯 Sâu (5.0°)')}</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Cài đặt điểm thưởng"
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '20px',
              padding: '6px 14px',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#0d9488',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              whiteSpace: 'nowrap'
            }}
          >
            <Settings size={16} />
            <span>Cài điểm (+{pointsPerCorrect}/-{penaltyPerWrong})</span>
          </button>
        </div>
      </div>

      {/* DEDICATED TEAM MANAGEMENT MODAL */}
      {showTeamModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '28px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} color="#0284c7" /> Quản Lý Danh Sách Đội Chơi
              </h3>
              <button
                onClick={() => setShowTeamModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 900, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
              {activeTeams.map((team, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span style={{ fontSize: '1.1rem' }}>🏆</span>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => handleRenameTeamName(idx, e.target.value)}
                      placeholder={`Đội ${idx + 1}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        flex: 1,
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      value={team.points !== undefined ? team.points : 0}
                      onChange={(e) => handleSetExactTeamPoints(idx, parseInt(e.target.value) || 0)}
                      style={{ width: '70px', padding: '6px 10px', borderRadius: '10px', border: '1.5px solid #0ea5e9', fontWeight: 900, fontSize: '0.95rem', textAlign: 'center', color: '#0284c7' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>điểm</span>

                    {activeTeams.length > 1 && (
                      <button
                        onClick={() => handleDeleteTeam(idx)}
                        title="Xóa đội này"
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', marginLeft: '6px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <button
                onClick={handleAddTeam}
                style={{
                  background: '#f0fdf4',
                  border: '1.5px dashed #22c55e',
                  color: '#15803d',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} /> Thêm Đội Mới
              </button>

              <button
                onClick={() => setShowTeamModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                Hoàn Tất & Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER SCORING SETTINGS MODAL */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '24px',
          background: '#ffffff',
          border: '2px solid #0d9488',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          zIndex: 100,
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f766e', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} /> Cài Đặt Ghi Điểm Tự Động
          </h4>

          <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '8px 12px', borderRadius: '10px' }}>
            ⚡ <strong>Tự động cộng/trừ điểm:</strong> Hệ thống sẽ tự động cập nhật và cộng/trừ điểm chính xác cho đội chơi khi nghiêng đầu chọn đáp án.
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
              🎯 Điểm cộng tự động khi ĐÚNG:
            </label>
            <input 
              type="number" 
              value={pointsPerCorrect} 
              onChange={(e) => setPointsPerCorrect(parseInt(e.target.value) || 10)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
              ❌ Điểm trừ tự động khi SAI:
            </label>
            <input 
              type="number" 
              value={penaltyPerWrong} 
              onChange={(e) => setPenaltyPerWrong(parseInt(e.target.value) || 10)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '0.95rem' }}
            />
          </div>

          <button 
            onClick={() => setShowSettings(false)} 
            style={{ padding: '10px', background: '#0d9488', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', marginTop: '6px' }}
          >
            Lưu & Đóng Cài Đặt
          </button>
        </div>
      )}

      {/* QUESTION BANNER CARD */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '24px 32px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
        marginBottom: '28px',
        border: '2px solid rgba(255, 255, 255, 0.8)'
      }}>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.4 }}>
          {currentQ.question}
        </h2>
      </div>

      {/* MAIN PLAYING ARENA: LEFT OPTION - CIRCULAR CAMERA - RIGHT OPTION */}
      {!isGameStarted ? (
        <StartGameOverlay
          title="Nghiêng Đầu Chọn Đáp Án"
          icon="🙆"
          onStart={() => {
            setIsGameStarted(true);
            setIsTimerRunning(true);
          }}
        />
      ) : (
        <>
          <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 260px 1fr',
        gap: '24px',
        alignItems: 'center',
        width: '100%',
        margin: 'auto 0'
      }}>

        {/* LEFT OPTION BLOCK A (DEFAULT BLUE #0284c7) */}
        <div
          onClick={() => handleChooseOption('A')}
          style={{
            background: optionABg,
            borderRadius: '28px',
            height: '240px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#ffffff',
            boxShadow: tiltDirection === 'left'
              ? '0 0 40px #0284c7, 0 15px 35px rgba(2,132,199,0.6)'
              : '0 15px 35px rgba(2, 132, 199, 0.3)',
            transform: tiltDirection === 'left' ? 'scale(1.04) translateY(-3px)' : 'scale(1)',
            transition: 'all 0.25s ease',
            cursor: answerState ? 'default' : 'pointer',
            position: 'relative',
            border: tiltDirection === 'left' ? '4px solid #ffffff' : 'none',
            overflow: 'hidden'
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>👈</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, textAlign: 'center', padding: '0 16px' }}>
            {optionA}
          </h3>

          {/* Active Hold Progress Bar for Left Option */}
          {tiltDirection === 'left' && !answerState && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '20px',
              right: '20px',
              height: '8px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${holdProgress}%`,
                background: '#ffffff',
                transition: 'width 0.05s linear'
              }} />
            </div>
          )}
        </div>

        {/* CENTER CIRCULAR WEBCAM PREVIEW */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            width: '210px',
            height: '210px',
            borderRadius: '50%',
            padding: '8px',
            background: tiltDirection === 'left' 
              ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' 
              : tiltDirection === 'right'
                ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: tiltDirection !== 'center'
              ? '0 0 35px #0284c7'
              : '0 0 25px rgba(34, 197, 94, 0.5)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#020617',
              position: 'relative'
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
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0f172a',
                  color: '#94a3b8',
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '0.8rem'
                }}>
                  <Camera size={32} color="#0d9488" style={{ marginBottom: '6px' }} />
                  <span>Bấm chuột vào đáp án nếu không dùng camera</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Status & Active Tilt Hold Indicator (1.2s Hold Confirmation Prompt) */}
          <div style={{
            background: '#ffffff',
            padding: '8px 18px',
            borderRadius: '18px',
            fontSize: '0.82rem',
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
            color: tiltDirection !== 'center' ? '#0284c7' : '#16a34a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            maxWidth: '240px',
            textAlign: 'center'
          }}>
            <div>
              {tiltDirection === 'left' 
                ? `👈 ĐANG NGHIÊNG TRÁI (Đáp án A) [${Math.abs(currentTiltAngleDeg)}°]` 
                : (tiltDirection === 'right' 
                  ? `👉 ĐANG NGHIÊNG PHẢI (Đáp án B) [${Math.abs(currentTiltAngleDeg)}°]` 
                  : `🟢 ĐẦU ĐỨNG THẲNG (${currentTiltAngleDeg > 0 ? '+' : ''}${currentTiltAngleDeg}°)`)}
            </div>

            {tiltDirection !== 'center' && !answerState ? (
              <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 900, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>⏳ Giữ nghiêng 1s để chốt ({holdProgress}%)</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>💡 Muốn đổi ý? Đứng thẳng lại!</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                💡 Nghiêng nhẹ đầu 1s để chọn
              </div>
            )}
          </div>
        </div>

        {/* RIGHT OPTION BLOCK B (DEFAULT BLUE #0284c7) */}
        <div
          onClick={() => handleChooseOption('B')}
          style={{
            background: optionBBg,
            borderRadius: '28px',
            height: '240px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#ffffff',
            boxShadow: tiltDirection === 'right'
              ? '0 0 40px #0284c7, 0 15px 35px rgba(2,132,199,0.6)'
              : '0 15px 35px rgba(2, 132, 199, 0.3)',
            transform: tiltDirection === 'right' ? 'scale(1.04) translateY(-3px)' : 'scale(1)',
            transition: 'all 0.25s ease',
            cursor: answerState ? 'default' : 'pointer',
            position: 'relative',
            border: tiltDirection === 'right' ? '4px solid #ffffff' : 'none',
            overflow: 'hidden'
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>👉</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, textAlign: 'center', padding: '0 16px' }}>
            {optionB}
          </h3>

          {/* Active Hold Progress Bar for Right Option */}
          {tiltDirection === 'right' && !answerState && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '20px',
              right: '20px',
              height: '8px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${holdProgress}%`,
                background: '#ffffff',
                transition: 'width 0.05s linear'
              }} />
            </div>
          )}
        </div>

      </div>

      {/* ANSWER RESULT BANNER WITH AUTOMATIC SCORE CHANGE NOTIFICATION */}
      {answerState && (
        <div style={{
          width: '100%',
          background: answerState === 'correct' 
            ? '#10b981' 
            : answerState === 'timeout'
              ? '#f59e0b'
              : '#ef4444',
          borderRadius: '20px',
          padding: '18px 24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {answerState === 'correct' ? (
                <>
                  <span>🎉 CHÍNH XÁC! TỰ ĐỘNG CỘNG +{pointsPerCorrect} ĐIỂM</span>
                  {lastScoreEvent && <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>[{lastScoreEvent.teamName}]</span>}
                </>
              ) : answerState === 'timeout' ? (
                '⏰ HẾT GIỜ TRẬN ĐẤU'
              ) : (
                <>
                  <span>❌ CHƯA ĐÚNG! TỰ ĐỘNG TRỪ -{penaltyPerWrong} ĐIỂM</span>
                  {lastScoreEvent && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>[{lastScoreEvent.teamName}]</span>}
                </>
              )}
            </div>
            <div style={{ fontSize: '0.92rem', opacity: 0.95, marginTop: '4px' }}>
              Đáp án đúng là: <strong>{correctOptionKey === 'A' ? optionA : optionB}</strong>
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            style={{
              padding: '12px 28px',
              borderRadius: '16px',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 900,
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Câu Tiếp Theo ➡️
          </button>
        </div>
      )}
        </>
      )}

      {/* BOTTOM FOOTER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '24px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(0,0,0,0.06)'
      }}>
        <button
          onClick={onClose}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '20px',
            padding: '8px 20px',
            fontWeight: 800,
            fontSize: '0.88rem',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <ArrowLeft size={16} />
          <span>THOÁT</span>
        </button>

        <button
          onClick={cameraActive ? stopCamera : startCamera}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4f46e5',
            fontWeight: 800,
            fontSize: '0.85rem',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          📷 {cameraActive ? 'Tắt camera (Chuyển dùng chuột)' : 'Không thấy camera, nhấn vào đây để bật'}
        </button>

        <div style={{ width: '90px' }} />
      </div>

    </div>
  );
}
