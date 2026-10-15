import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Volume2, VolumeX, Maximize, RotateCcw, Trophy, Settings, Camera, CheckCircle2, XCircle, Clock, ArrowLeft, HelpCircle, Users, Award, Play, Edit3, Plus, Minus, Trash2, Zap, Upload, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion, parseUploadedFile } from '../../utils/universalParser';

// Eagerly import all 20 pose images from src/assets/batchuocnhanhcohoilon for 100% reliable bundling
const poseImageModules = import.meta.glob('/src/assets/batchuocnhanhcohoilon/*.png', { eager: true, import: 'default' });

const getPoseImgUrl = (num) => {
  const assetKey = `/src/assets/batchuocnhanhcohoilon/${num}.png`;
  if (poseImageModules[assetKey]) {
    return poseImageModules[assetKey];
  }
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
  return `${base}/batchuocnhanhcohoilon/${num}.png`;
};

export function getStickmanPoseSVG(numOrType, color = '#3b82f6') {
  const c = color;
  let bodyLines = '';

  const id = typeof numOrType === 'number' ? ((numOrType - 1) % 4) + 1 : numOrType;

  if (id === 1 || id === 'left_arm') {
    // Left arm raised high (screen-left)
    bodyLines = `<path d="M 50 45 L 20 18 M 50 45 L 75 60" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
  } else if (id === 2 || id === 'both_arms') {
    // Both arms raised high V-shape
    bodyLines = `<path d="M 50 45 L 20 18 M 50 45 L 80 18" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
  } else if (id === 3 || id === 'right_arm') {
    // Right arm raised high (screen-right)
    bodyLines = `<path d="M 50 45 L 25 60 M 50 45 L 80 18" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
  } else {
    // Both arms spread wide horizontally
    bodyLines = `<path d="M 50 45 L 12 45 M 50 45 L 88 45" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
    <circle cx="50" cy="22" r="12" fill="${c}" />
    <path d="M 50 34 L 50 65" stroke="${c}" stroke-width="7" stroke-linecap="round" />
    ${bodyLines}
    <path d="M 50 65 L 35 95 M 50 65 L 65 95" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 4 Standard Upper-Body Poses mapped to Options A, B, C, D
export const UPPER_BODY_POSES = [
  {
    id: 1,
    key: 'A',
    name: 'Động tác 1: Giơ tay trái',
    shortName: 'Giơ tay trái',
    icon: '🙋‍♂️',
    image: getPoseImgUrl(16),
    isMirroredImage: true,
    color: '#0284c7', // Sky Blue
    guideHint: 'Đưa tay trái lên cao hoặc nghiêng nhẹ sang trái'
  },
  {
    id: 2,
    key: 'B',
    name: 'Động tác 2: Giơ cả 2 tay lên',
    shortName: 'Giơ cả 2 tay',
    icon: '🙌',
    image: getPoseImgUrl(2),
    isMirroredImage: false,
    color: '#dc2626', // Red
    guideHint: 'Đưa cả 2 tay lên cao hình chữ V'
  },
  {
    id: 3,
    key: 'C',
    name: 'Động tác 3: Giơ tay phải',
    shortName: 'Giơ tay phải',
    icon: '🙋‍♀️',
    image: getPoseImgUrl(16),
    isMirroredImage: false,
    color: '#16a34a', // Green
    guideHint: 'Đưa tay phải lên cao hoặc nghiêng nhẹ sang phải'
  },
  {
    id: 4,
    key: 'D',
    name: 'Động tác 4: Dang 2 tay ngang',
    shortName: 'Dang 2 tay ngang',
    icon: '👐',
    image: getPoseImgUrl(4),
    isMirroredImage: false,
    color: '#9333ea', // Purple
    guideHint: 'Mở rộng hai tay sang hai bên'
  }
];

export function PoseImitationGame({ questions, teams, onAddPoints, activeTeamIndex = 0, setActiveTeamIndex, onClose, lessonTitle, title }) {
  const fileInputRef = useRef(null);
  const [loadedQuestions, setLoadedQuestions] = useState(null);
  const activeQuestionsList = loadedQuestions || questions;

  const safeQuestions = (Array.isArray(activeQuestionsList) && activeQuestionsList.length > 0) ? activeQuestionsList : [
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLoadedQuestions(parsed);
        setCurrentQIndex(0);
        try { SoundFX.correct(); } catch(err) {}
        alert(`Đã tải thành công ${parsed.length} câu hỏi từ file!`);
      } else {
        alert('Không tìm thấy câu hỏi hợp lệ trong file.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đọc file câu hỏi: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

  // Temporal smoothing refs to avoid camera noise flicker (Rule 16 compliant)
  const prevFrameDataRef = useRef(null);
  const bgModelRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const smoothedScoresRef = useRef([0, 0, 0, 0]);
  const holdCounterRef = useRef(0);
  const lastCandidateRef = useRef(null);

  const currentQ = safeQuestions[currentQIndex % safeQuestions.length];
  const qOptions = currentQ.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];

  // Map each option to the corresponding upper-body pose
  const currentQuestionPoses = useMemo(() => {
    return qOptions.map((_, idx) => UPPER_BODY_POSES[idx % UPPER_BODY_POSES.length]);
  }, [qOptions]);

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

  // High-Performance Forgiving Relative-Accuracy Computer Vision Engine (30fps Throttled, Rule 16)
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

      const now = performance.now();
      // Throttle to 30fps (~33ms) per Rule 16
      if (now - lastFrameTimeRef.current < 33) {
        animFrameId = requestAnimationFrame(processPoseFrame);
        return;
      }
      lastFrameTimeRef.current = now;

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        // Draw mirrored so canvas horizontal coordinates match screen coordinates 1:1
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -160, 0, 160, 120);
        ctx.restore();

        const imgData = ctx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        // Initialize background baseline & prevFrame
        if (!bgModelRef.current || bgModelRef.current.length !== data.length) {
          bgModelRef.current = new Uint8Array(data);
          prevFrameDataRef.current = new Uint8Array(data);
          animFrameId = requestAnimationFrame(processPoseFrame);
          return;
        }

        const bgData = bgModelRef.current;
        const prevData = prevFrameDataRef.current;

        let leftZoneActive = 0;
        let rightZoneActive = 0;
        let wideZoneActive = 0;
        let totalMotion = 0;

        for (let y = 8; y < 100; y += 2) {
          for (let x = 6; x < 154; x += 2) {
            const idx = (y * 160 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const bgR = bgData[idx];
            const bgG = bgData[idx + 1];
            const bgB = bgData[idx + 2];

            const prevR = prevData[idx];
            const prevG = prevData[idx + 1];
            const prevB = prevData[idx + 2];

            // Motion difference
            const motion = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
            totalMotion += motion;

            // Background baseline difference
            const bgDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

            // True skin check (strictly rejects beige/cream/white walls)
            const isSkin = (r > 48 && g > 32 && b > 20 && r > g && g > b && (r - g) >= 8 && (r - b) >= 12);

            // Active foreground presence
            const isForeground = (bgDiff > 28 && (isSkin || motion > 16 || bgDiff > 42));

            if (isForeground) {
              if (y < 55 && x < 68) leftZoneActive++;
              if (y < 55 && x > 92) rightZoneActive++;
              if (y >= 35 && y <= 95 && (x < 36 || x > 124)) wideZoneActive++;
            }
          }
        }

        // Update prevFrameData
        prevData.set(data);

        // Adaptive background update when scene is relatively quiet
        const sampledPixels = ((100 - 8) * (154 - 6)) / 4;
        const avgMotion = totalMotion / sampledPixels;
        if (avgMotion < 15) {
          for (let i = 0; i < data.length; i += 8) {
            bgData[i] = (bgData[i] * 24 + data[i]) / 25;
            bgData[i + 1] = (bgData[i + 1] * 24 + data[i + 1]) / 25;
            bgData[i + 2] = (bgData[i + 2] * 24 + data[i + 2]) / 25;
          }
        }

        // Raw candidate scores for the 4 gestures (0: Left, 1: Both, 2: Right, 3: Wide)
        const bothMin = Math.min(leftZoneActive, rightZoneActive);
        const rawBoth = Math.min(99, Math.round((bothMin / 40) * 100));

        const leftOnly = Math.max(0, leftZoneActive - Math.round(rightZoneActive * 0.65));
        const rawLeft = Math.min(99, Math.round((leftOnly / 38) * 100));

        const rightOnly = Math.max(0, rightZoneActive - Math.round(leftZoneActive * 0.65));
        const rawRight = Math.min(99, Math.round((rightOnly / 38) * 100));

        const rawWide = Math.min(99, Math.round((wideZoneActive / 45) * 100));

        const rawScores = [rawLeft, rawBoth, rawRight, rawWide];

        // Smooth scores with Exponential Moving Average (EMA)
        const smoothed = smoothedScoresRef.current.map((prev, i) => {
          return Math.round(prev * 0.55 + rawScores[i] * 0.45);
        });
        smoothedScoresRef.current = smoothed;

        // Evaluate dominant candidate among the available options in qOptions
        let bestCandidate = null;
        let highestScore = 0;
        let secondHighest = 0;

        for (let i = 0; i < qOptions.length; i++) {
          const score = smoothed[i] || 0;
          if (score > highestScore) {
            secondHighest = highestScore;
            highestScore = score;
            bestCandidate = i;
          } else if (score > secondHighest) {
            secondHighest = score;
          }
        }

        // Forgiving relative accuracy threshold: >= 25% with only >= 4% margin over second place
        const isCandidateMatch = (highestScore >= 25) && ((highestScore - secondHighest) >= 4) && (bestCandidate < qOptions.length);

        if (isCandidateMatch) {
          if (lastCandidateRef.current === bestCandidate) {
            holdCounterRef.current += 1;
          } else {
            lastCandidateRef.current = bestCandidate;
            holdCounterRef.current = 1;
          }

          setDetectedPoseIdx(bestCandidate);
          setPoseAccuracyScore(Math.min(98, highestScore + 10));

          // Quick & responsive hold: 6 frames (~0.2s hold)
          const progressPct = Math.min(100, Math.round((holdCounterRef.current / 6) * 100));
          setPoseHoldProgress(progressPct);

          if (holdCounterRef.current >= 6) {
            handleChooseOption(bestCandidate);
            holdCounterRef.current = 0;
            lastCandidateRef.current = null;
          }
        } else {
          holdCounterRef.current = Math.max(0, holdCounterRef.current - 1);
          if (holdCounterRef.current === 0) {
            lastCandidateRef.current = null;
            setDetectedPoseIdx(null);
            setPoseAccuracyScore(0);
            setPoseHoldProgress(0);
          } else {
            const progressPct = Math.min(100, Math.round((holdCounterRef.current / 6) * 100));
            setPoseHoldProgress(progressPct);
          }
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
          {lessonTitle || title || 'Nhận diện camera AI tương đối linh hoạt — Làm động tác gần giống là nhận'}
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
                Nhận diện thông minh với độ chính xác tương đối
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#e0e7ff', margin: 0, lineHeight: 1.4 }}>
                Người chơi chỉ cần làm động tác gần giống (giơ tay trái, giơ cả 2 tay, giơ tay phải hoặc dang tay) trong ~0.2s là hệ thống tự động ghi nhận ngay lập tức.
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
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999999,
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      boxSizing: 'border-box',
      overflowY: 'auto',
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .docx, .doc, .txt"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '6px 12px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Nhập file câu hỏi"
          >
            <Upload size={14} /> Nhập File
          </button>

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

          {onClose && (
            <button onClick={onClose} style={{ padding: '6px 12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={14} /> Thoát
            </button>
          )}
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
              const poseInfo = currentQuestionPoses[idx] || UPPER_BODY_POSES[idx % UPPER_BODY_POSES.length];
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
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getStickmanPoseSVG(poseInfo.id, poseInfo.color);
                      }}
                      style={{ 
                        height: '115px', 
                        maxWidth: '118px', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                        transform: poseInfo.isMirroredImage ? 'scaleX(-1)' : 'none'
                      }} 
                    />
                  </div>

                  {/* Option Text & Pose Label */}
                  <div style={{ flex: 1, padding: '0 18px', textAlign: 'center', position: 'relative' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.28)', padding: '4px 14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      {poseInfo.name}
                    </div>
                    <h3 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                      {optText}
                    </h3>
                    <div style={{ fontSize: '0.86rem', opacity: 0.95, marginTop: '6px', fontWeight: 700, color: '#fef08a' }}>
                      💡 {poseInfo.guideHint}
                    </div>

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
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getStickmanPoseSVG(poseInfo.id, poseInfo.color);
                      }}
                      style={{ 
                        height: '115px', 
                        maxWidth: '118px', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                        transform: poseInfo.isMirroredImage ? 'scaleX(-1)' : 'none'
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

        {/* RIGHT COLUMN: CAMERA WEBCAM FEED & FORGIVING RELATIVE ACCURACY HUD */}
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

            {/* Target Guide Zones on Camera Preview */}
            {cameraActive && !answerState && (
              <>
                {/* Zone A: Tay Trái */}
                {qOptions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    background: detectedPoseIdx === 0 ? 'rgba(2, 132, 199, 0.95)' : 'rgba(15, 23, 42, 0.65)',
                    border: detectedPoseIdx === 0 ? '2.5px solid #ffffff' : '1.5px dashed rgba(255,255,255,0.4)',
                    boxShadow: detectedPoseIdx === 0 ? '0 0 20px #0284c7' : 'none',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    zIndex: 5
                  }}>
                    <span>🙋‍♂️ A: Tay Trái</span>
                  </div>
                )}

                {/* Zone B: Cả 2 Tay */}
                {qOptions.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    background: detectedPoseIdx === 1 ? 'rgba(220, 38, 38, 0.95)' : 'rgba(15, 23, 42, 0.65)',
                    border: detectedPoseIdx === 1 ? '2.5px solid #ffffff' : '1.5px dashed rgba(255,255,255,0.4)',
                    boxShadow: detectedPoseIdx === 1 ? '0 0 20px #dc2626' : 'none',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    zIndex: 5
                  }}>
                    <span>🙌 B: Cả 2 Tay</span>
                  </div>
                )}

                {/* Zone C: Tay Phải */}
                {qOptions.length > 2 && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    background: detectedPoseIdx === 2 ? 'rgba(22, 163, 74, 0.95)' : 'rgba(15, 23, 42, 0.65)',
                    border: detectedPoseIdx === 2 ? '2.5px solid #ffffff' : '1.5px dashed rgba(255,255,255,0.4)',
                    boxShadow: detectedPoseIdx === 2 ? '0 0 20px #16a34a' : 'none',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    zIndex: 5
                  }}>
                    <span>🙋‍♀️ C: Tay Phải</span>
                  </div>
                )}

                {/* Zone D: Dang Ngang (if 4 options) */}
                {qOptions.length > 3 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    background: detectedPoseIdx === 3 ? 'rgba(147, 51, 234, 0.95)' : 'rgba(15, 23, 42, 0.65)',
                    border: detectedPoseIdx === 3 ? '2.5px solid #ffffff' : '1.5px dashed rgba(255,255,255,0.4)',
                    boxShadow: detectedPoseIdx === 3 ? '0 0 20px #9333ea' : 'none',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    zIndex: 5
                  }}>
                    <span>👐 D: Dang Ngang</span>
                  </div>
                )}
              </>
            )}

            {/* AI Real-Time Forgiving Accuracy HUD Display Badge */}
            {cameraActive && !answerState && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                background: 'rgba(15, 23, 42, 0.92)',
                color: '#ffffff',
                padding: '8px 20px',
                borderRadius: '24px',
                fontWeight: 900,
                fontSize: '0.9rem',
                backdropFilter: 'blur(8px)',
                border: detectedPoseIdx !== null ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: detectedPoseIdx !== null ? '0 6px 20px rgba(34, 197, 94, 0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                maxWidth: '90%',
                zIndex: 6
              }}>
                {detectedPoseIdx !== null ? (
                  <>
                    <Zap size={18} color="#22c55e" />
                    <div>
                      <div style={{ color: '#4ade80', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>
                        🎯 ĐANG CHỌN: {currentQuestionPoses[detectedPoseIdx]?.shortName} ({poseAccuracyScore}%)
                      </div>
                      <div style={{
                        marginTop: '4px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        height: '6px',
                        overflow: 'hidden',
                        width: '160px'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${poseHoldProgress}%`,
                          background: '#22c55e',
                          borderRadius: '6px',
                          transition: 'width 0.1s linear'
                        }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
                    📷 Làm động tác gần giống để chọn đáp án (hoặc bấm chuột)
                  </span>
                )}
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

    </div>,
    document.body
  );
}
