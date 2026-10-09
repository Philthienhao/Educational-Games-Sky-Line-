import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, RotateCcw, Volume2, VolumeX, Maximize, X, 
  Play, FastForward, Clock, Users, ArrowRight, Award, 
  Sparkles, CheckCircle, RefreshCw, Zap, Shield, HelpCircle,
  UserPlus, FileText, Upload, Check, Edit3, Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storage';
import { parseStudentRosterFile } from '../../utils/universalParser';

// Color palette for student marbles matching video aesthetic
const MARBLE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
  '#14b8a6', '#84cc16', '#eab308', '#0284c7', '#a855f7',
  '#f43f5e', '#64748b', '#0d9488', '#2563eb', '#7c3aed',
  '#db2777', '#ca8a04', '#16a34a', '#0891b2', '#4f46e5'
];

// Default sample classes if no homeroom is set
const DEFAULT_CLASS_ROSTER = [
  'Thới Ngọc Hoà', 'Phạm Thị Phương Vy', 'Trương Trọng Phúc', 'Trần Ngọc Thúy',
  'Nguyễn Quốc Cường', 'Võ Minh Đức', 'Lê Hữu Phát', 'Bùi Đức Tiến',
  'Đỗ Thanh Huy', 'Hoàng Khánh Tùng', 'Dương Sanh Minh', 'Vũ Duy Nhật',
  'Ngô Như Huyền', 'Đinh Công Bảo', 'Lâm Nam Giang', 'Hoàng Hải',
  'Nguyễn Minh Tú', 'Trịnh Quang Phát', 'Thái Bảo Ngọc', 'Lý Thùy Nhung',
  'Trần Minh Thuận', 'Hà Ngọc Minh', 'Phan Hữu Phước', 'Cao Trọng Nguyên', 'Đỗ Quỳnh Anh'
];

const DEFAULT_STUDENT_ROSTERS = {
  'Lớp 9A1 (Mẫu 24 HS)': [
    'Hồ Thị Uyên', 'Văn An', 'Quốc Hùng', 'Thị Linh', 'Thị Nhung', 'Thị Thanh',
    'Văn Sơn', 'Thị Quỳnh', 'Minh Hoàng', 'Văn Khải', 'Thị Dung', 'Văn Trường',
    'Thị Thu', 'Thị Hoa', 'Văn Minh', 'Thị Lan', 'Văn Hùng', 'Thị Hạnh',
    'Văn Nam', 'Thị Trang', 'Văn Tú', 'Thị Thảo', 'Văn Cường', 'Thị Vân'
  ],
  'Lớp 10A2 (Mẫu 15 HS)': [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Vũ Thị E',
    'Đặng Văn F', 'Bùi Thị G', 'Đỗ Minh H', 'Hồ Văn I', 'Nông Thị K',
    'Trịnh Văn L', 'Phan Thị M', 'Lương Văn N', 'Ngô Thị O', 'Dương Văn P'
  ],
  'Lớp 6A3 (Mẫu 10 HS)': [
    'An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hương', 'Khánh', 'Linh', 'Minh', 'Nam'
  ]
};

export function MarbleRaceGame({ onClose, currentUser, onAddPoints }) {
  // --- Audio Synthesis Setup ---
  const audioCtxRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const playSynthSound = (type) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'gateOpen') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'bumper') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520 + Math.random() * 120, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'fanHit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'boost') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.3, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.4);
        });
      }
    } catch (e) {}
  };

  // --- Student Data Loading ---
  const [homeroom, setHomeroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState('Lớp Mẫu 25 Học Sinh');

  // Custom Roster State
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [customRosterText, setCustomRosterText] = useState('');
  const [customClassNameInput, setCustomClassNameInput] = useState('');
  const fileInputRef = useRef(null);

  const loadStudents = () => {
    try {
      const hr = StorageService.getTeacherHomeroom(currentUser?.id);
      if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
        const cleanStudents = hr.students.filter(s => {
          const sName = (typeof s === 'string' ? s : (s?.name || s?.studentName || '')).trim().toLowerCase();
          return sName !== 'tran thi b' && sName !== 'nguyen van a';
        });
        setHomeroom({ ...hr, students: cleanStudents });
        setSelectedClassName(hr.className || 'Lớp Chủ Nhiệm');
        setStudents(cleanStudents.map((s, idx) => ({
          id: s.id || `s_${idx}`,
          name: typeof s === 'string' ? s : (s.name || s.studentName || `Học sinh ${idx + 1}`),
          avatar: s.avatar || null,
          number: idx + 1,
          color: MARBLE_COLORS[idx % MARBLE_COLORS.length]
        })));
      } else {
        setSelectedClassName('Lớp Mẫu 25 Học Sinh');
        setStudents(DEFAULT_CLASS_ROSTER.map((name, idx) => ({
          id: `default_${idx}`,
          name,
          avatar: null,
          number: idx + 1,
          color: MARBLE_COLORS[idx % MARBLE_COLORS.length]
        })));
      }
    } catch (e) {
      setSelectedClassName('Lớp Mẫu 25 Học Sinh');
      setStudents(DEFAULT_CLASS_ROSTER.map((name, idx) => ({
        id: `default_${idx}`,
        name,
        avatar: null,
        number: idx + 1,
        color: MARBLE_COLORS[idx % MARBLE_COLORS.length]
      })));
    }
  };

  useEffect(() => {
    loadStudents();
  }, [currentUser]);

  // --- Game State ---
  const [simSpeed, setSimSpeed] = useState(0.75); // 0.5, 0.75, 1, 1.5, 2, 3
  const [gameState, setGameState] = useState('gate_locked'); // 'gate_locked', 'counting_down', 'racing', 'finished'
  const [gateStep, setGateStep] = useState(0); // 0 = locked, 1 = nut 1, 2 = nut 2, 3 = nut 3, 4 = open
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [currentStageName, setCurrentStageName] = useState('Chặng 1 · Đệm nảy Pinball & Bệ phóng');
  
  // Commentary feed & Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [commentaryLog, setCommentaryLog] = useState([
    { id: 1, time: '00:00,0', text: 'Thanh gạt chắn đang khóa. Chuẩn bị xuất phát!' }
  ]);

  // Winner & Modals
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showLuckyCardModal, setShowLuckyCardModal] = useState(false);
  const [showFullStandingsModal, setShowFullStandingsModal] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [luckyCard, setLuckyCard] = useState(null);
  const [awardedPoints, setAwardedPoints] = useState(0);

  // Canvas & Physics Refs
  const canvasRef = useRef(null);
  const minimapCanvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const stateRef = useRef({
    balls: [],
    gateOpen: false,
    gateY: 175,
    gateOffset: 0,
    cameraY: 0,
    totalHeight: 7100,
    trackWidth: 720,
    startTime: 0,
    finishedBalls: [],
    fanAngle1: 0,
    fanAngle2: 0,
    pendulumAngle: 0,
    seesawAngle1: 0,
    seesawAngle2: 0,
    wheelAngle1: 0,
    wheelAngle2: 0,
    lastCommentaryTime: 0,
    previousRankings: []
  });

  // Track Segments Definition - Exactly 10 Distinct Stages
  const STAGES = [
    { startY: 0, endY: 700, name: 'Chặng 1 · Đệm nảy Pinball & Bệ phóng' },
    { startY: 700, endY: 1400, name: 'Chặng 2 · Ngã ba định mệnh & Mũi tên chia dòng' },
    { startY: 1400, endY: 2100, name: 'Chặng 3 · Cánh quạt tử thần 3 cánh xoay' },
    { startY: 2100, endY: 2800, name: 'Chặng 4 · Búa lắc con lắc khổng lồ quét ngang' },
    { startY: 2800, endY: 3500, name: 'Chặng 5 · Cổng không gian huyền bí & Đệm lướt Slingshot' },
    { startY: 3500, endY: 4200, name: 'Chặng 6 · Thác trượt Zíc-Zắc & Gờ ma sát đảo chiều' },
    { startY: 4200, endY: 4900, name: 'Chặng 7 · Cầu bập bênh nghiêng động lực học' },
    { startY: 4900, endY: 5600, name: 'Chặng 8 · Ma trận chốt ghim Galton đa tầng' },
    { startY: 5600, endY: 6300, name: 'Chặng 9 · Guồng quay trục xoay 4 cánh chướng ngại' },
    { startY: 6300, endY: 7100, name: 'Chặng 10 · Đại phễu xoáy nước & Cổ chai về đích' }
  ];

  // Helper format time
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${ms}`;
  };

  const getInitials = (name) => {
    if (!name) return 'HS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Add message to commentary
  const addCommentary = (text, timeSec) => {
    setCommentaryLog(prev => [
      { id: Date.now() + Math.random(), time: formatTime(timeSec), text },
      ...prev.slice(0, 40)
    ]);
  };

  // Open Custom Roster Modal
  const handleOpenRosterModal = () => {
    if (!customRosterText.trim()) {
      const currentNames = students.map(s => s.name).join('\n');
      setCustomRosterText(currentNames);
    }
    if (!customClassNameInput.trim()) {
      setCustomClassNameInput(selectedClassName);
    }
    setShowRosterModal(true);
  };

  // Apply Custom Roster
  const handleApplyCustomRoster = () => {
    const lines = customRosterText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      alert('Vui lòng nhập ít nhất 2 học sinh để bắt đầu cuộc đua bi!');
      return;
    }

    const className = customClassNameInput.trim() || `Lớp Tùy Chọn (${lines.length} HS)`;
    const newStudents = lines.map((name, idx) => ({
      id: `custom_${Date.now()}_${idx}`,
      name,
      avatar: null,
      number: idx + 1,
      color: MARBLE_COLORS[idx % MARBLE_COLORS.length]
    }));

    setSelectedClassName(className);
    setStudents(newStudents);
    setShowRosterModal(false);

    try {
      const storageKey = `gvd_marble_custom_roster_${currentUser?.id || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify({
        className,
        names: lines
      }));
    } catch (e) {}

    addCommentary(`Đã nạp danh sách "${className}" (${lines.length} học sinh)! Chuẩn bị xuất phát.`, 0);
  };

  // Preset Handlers
  const handleLoadHomeroomPreset = () => {
    try {
      const hr = StorageService.getTeacherHomeroom(currentUser?.id);
      if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
        const names = hr.students
          .map((s, idx) => typeof s === 'string' ? s : (s.name || s.studentName || `Học sinh ${idx + 1}`))
          .filter(n => {
            const low = n.trim().toLowerCase();
            return low !== 'tran thi b' && low !== 'nguyen van a';
          });
        setCustomRosterText(names.join('\n'));
        setCustomClassNameInput(hr.className || 'Lớp Chủ Nhiệm');
      } else {
        alert('Chưa có danh sách Lớp Chủ Nhiệm. Bạn có thể chọn lớp mẫu hoặc dán danh sách học sinh!');
      }
    } catch (e) {
      alert('Không thể tải lớp chủ nhiệm: ' + e.message);
    }
  };

  const handleLoadSamplePreset = (countOrKey) => {
    if (typeof countOrKey === 'string' && DEFAULT_STUDENT_ROSTERS[countOrKey]) {
      const sample = DEFAULT_STUDENT_ROSTERS[countOrKey];
      setCustomRosterText(sample.join('\n'));
      setCustomClassNameInput(countOrKey);
    } else {
      const count = Number(countOrKey) || 25;
      const sample = DEFAULT_CLASS_ROSTER.slice(0, count);
      setCustomRosterText(sample.join('\n'));
      setCustomClassNameInput(`Lớp Mẫu ${count} Học Sinh`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseStudentRosterFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const names = parsed.map(s => 
          (typeof s === 'object' && s !== null) ? (s.name || s.studentName || 'Học sinh') : String(s || '')
        ).filter(Boolean);
        if (names.length > 0) {
          setCustomRosterText(names.join('\n'));
          const cleanFileName = file.name.replace(/\.[^/.]+$/, "");
          setCustomClassNameInput(`Tệp: ${cleanFileName}`);
          alert(`Đã nhập thành công ${names.length} học sinh từ tệp "${file.name}"!`);
        }
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi nhập tệp danh sách học sinh.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Reset & Initialize Race Physics ---
  const initRace = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    const trackWidth = 720;
    const count = students.length;
    const balls = [];
    const cols = Math.min(8, count);
    const rows = Math.ceil(count / cols);
    const startYBase = 80;
    const colSpacing = (trackWidth - 140) / (cols + 1);

    students.forEach((s, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const x = 70 + (c + 1) * colSpacing + (Math.random() - 0.5) * 6;
      const y = startYBase + r * 28 + (Math.random() - 0.5) * 4;
      balls.push({
        id: s.id,
        number: s.number,
        name: s.name,
        color: s.color,
        avatar: s.avatar,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 12,
        isFinished: false,
        finishTime: null,
        trail: [],
        rank: idx + 1
      });
    });

    stateRef.current = {
      balls,
      gateOpen: false,
      gateY: 175,
      gateOffset: 0,
      cameraY: 0,
      totalHeight: 7100,
      trackWidth: 720,
      startTime: 0,
      finishedBalls: [],
      fanAngle1: 0,
      fanAngle2: 0,
      pendulumAngle: 0,
      seesawAngle1: 0,
      seesawAngle2: 0,
      wheelAngle1: 0,
      wheelAngle2: 0,
      lastCommentaryTime: 0,
      previousRankings: []
    };

    setGameState('gate_locked');
    setGateStep(0);
    setElapsedTime(0);
    setWinner(null);
    setShowWinnerModal(false);
    setShowFullStandingsModal(false);
    setCurrentStageName('Chặng 1 · Đệm nảy Pinball & Bệ phóng');
    setAwardedPoints(0);
    setLeaderboard(balls.map(b => ({ ...b })));
    setCommentaryLog([
      { id: 1, time: '00:00,0', text: 'Thanh gạt chắn đang khóa. Chuẩn bị xuất phát!' }
    ]);
  };

  useEffect(() => {
    if (students.length > 0) {
      initRace();
    }
  }, [students]);

  // --- Step 1-2-3-4 Gate Countdown Handlers ---
  const handleStepClick = (step) => {
    if (gameState !== 'gate_locked' && gameState !== 'counting_down') return;
    playSynthSound('tick');
    setGateStep(step);
    if (step >= 4) {
      triggerStartRace();
    }
  };

  const handleAutoCountdown = () => {
    if (gameState !== 'gate_locked') return;
    setGameState('counting_down');
    let currentStep = 1;
    setGateStep(1);
    playSynthSound('tick');

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= 4) {
        setGateStep(currentStep);
        playSynthSound('tick');
      }
      if (currentStep === 4) {
        clearInterval(timer);
        setTimeout(() => {
          triggerStartRace();
        }, 200);
      }
    }, 700);
  };

  const triggerStartRace = () => {
    playSynthSound('gateOpen');
    stateRef.current.gateOpen = true;
    stateRef.current.startTime = performance.now();
    setGameState('racing');
    addCommentary('Thanh gạt chắn mở! Cuộc đua bắt đầu.', 0);

    // Initial nudge to all balls so they drop cleanly with tiny entropy
    stateRef.current.balls.forEach(b => {
      b.vy = 2 + Math.random() * 2.5;
      b.vx = (Math.random() - 0.5) * 3;
    });
  };

  // Keyboard shortcut: Space to auto start
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && (gameState === 'gate_locked')) {
        e.preventDefault();
        handleAutoCountdown();
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && gameState === 'gate_locked') {
        const num = parseInt(e.code.replace('Digit', ''), 10);
        handleStepClick(num);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // --- Physics & Game Loop ---
  useEffect(() => {
    let lastFrameTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastFrameTime) / 1000, 0.05) * simSpeed;
      lastFrameTime = currentTime;

      const state = stateRef.current;
      const { balls, gateOpen, totalHeight, trackWidth } = state;

      // Update elapsed time
      if (state.startTime > 0 && gameState === 'racing') {
        const nowSec = ((currentTime - state.startTime) / 1000) * simSpeed;
        setElapsedTime(nowSec);
      }

      // Rotate fans & obstacles
      state.fanAngle1 += 2.0 * dt;
      state.fanAngle2 -= 2.4 * dt;
      state.pendulumAngle = Math.sin(currentTime * 0.0022 * simSpeed) * 0.95;
      state.seesawAngle1 = Math.sin(currentTime * 0.0025 * simSpeed) * 0.32;
      state.seesawAngle2 = Math.cos(currentTime * 0.0025 * simSpeed) * 0.32;
      state.wheelAngle1 += 1.8 * dt;
      state.wheelAngle2 -= 2.2 * dt;

      // Gate opening animation
      if (gateOpen && state.gateOffset < 300) {
        state.gateOffset += 350 * dt;
      }

      // Finish line coordinates
      const finishY = 6880;

      // --- 10 STAGES OBSTACLES DEFINITIONS ---
      // Bumpers across track
      const bumpers = [
        // Chặng 1: Concentric launch bumpers
        { x: 230, y: 310, r: 28 },
        { x: 360, y: 270, r: 32 },
        { x: 490, y: 310, r: 28 },
        { x: 170, y: 420, r: 28 },
        { x: 300, y: 430, r: 30 },
        { x: 420, y: 430, r: 30 },
        { x: 550, y: 420, r: 28 },
        { x: 240, y: 550, r: 30 },
        { x: 360, y: 540, r: 32 },
        { x: 480, y: 550, r: 30 },

        // Chặng 2: Split lane deflector bumpers
        { x: 210, y: 990, r: 26 },
        { x: 140, y: 1120, r: 26 },
        { x: 510, y: 990, r: 26 },
        { x: 580, y: 1120, r: 26 },

        // Chặng 4: Pendulum hammer corridor posts
        { x: 215, y: 2450, r: 20 },
        { x: 505, y: 2450, r: 20 },

        // Chặng 6: Slalom turnaround cushions
        { x: 630, y: 3690, r: 26 },
        { x: 90, y: 3900, r: 26 },
        { x: 630, y: 4110, r: 26 },

        // Chặng 9: Paddle wheel channel deflectors
        { x: 175, y: 5950, r: 22 },
        { x: 545, y: 5950, r: 22 },

        // Chặng 10: Grand funnel guide bumpers
        { x: 270, y: 6480, r: 26 },
        { x: 450, y: 6480, r: 26 }
      ];

      // Chặng 2 Fork wedge (Upward pointing arrow wedge)
      const forkArrowTip = { x: 360, y: 730 };
      const forkArrowBase = { x: 360, y: 860 };

      // Chặng 3 Rotating Fans (Spanning the left and right channels)
      const fans = [
        { x: 250, y: 1720, radius: 85, angle: state.fanAngle1 },
        { x: 470, y: 1720, radius: 85, angle: state.fanAngle2 }
      ];

      // Chặng 4 Swinging Pendulum Hammer
      const pendulumPivot = { x: 360, y: 2220 };
      const pendulumLen = 220;
      const pendulumBob = {
        x: pendulumPivot.x + Math.sin(state.pendulumAngle) * pendulumLen,
        y: pendulumPivot.y + Math.cos(state.pendulumAngle) * pendulumLen,
        radius: 32
      };

      // Chặng 5 Wormhole Portals & Speed Boost Pad
      const portalIn = { x: 600, y: 2930, r: 28 };
      const portalOut = { x: 150, y: 3280, r: 28 };
      const boostPad = { x: 230, y: 3120, w: 260, h: 48, boostVx: 8, boostVy: 18 };

      // Chặng 7 Tilting Seesaws
      const seesawLen = 250;
      const seesaws = [
        {
          px: 360,
          py: 4480,
          angle: state.seesawAngle1,
          p1: {
            x: 360 - Math.cos(state.seesawAngle1) * (seesawLen / 2),
            y: 4480 - Math.sin(state.seesawAngle1) * (seesawLen / 2)
          },
          p2: {
            x: 360 + Math.cos(state.seesawAngle1) * (seesawLen / 2),
            y: 4480 + Math.sin(state.seesawAngle1) * (seesawLen / 2)
          }
        },
        {
          px: 360,
          py: 4700,
          angle: state.seesawAngle2,
          p1: {
            x: 360 - Math.cos(state.seesawAngle2) * (seesawLen / 2),
            y: 4700 - Math.sin(state.seesawAngle2) * (seesawLen / 2)
          },
          p2: {
            x: 360 + Math.cos(state.seesawAngle2) * (seesawLen / 2),
            y: 4700 + Math.sin(state.seesawAngle2) * (seesawLen / 2)
          }
        }
      ];

      // Chặng 8 Galton Pegs Grid (Dense 8-row pinboard)
      const galtonPegs = [];
      const pegRows = 8;
      for (let r = 0; r < pegRows; r++) {
        const count = 9 - (r % 2);
        const y = 5040 + r * 60;
        const startX = (r % 2 === 0) ? 140 : 175;
        for (let c = 0; c < count; c++) {
          galtonPegs.push({ x: startX + c * 52, y, r: 9 });
        }
      }

      // Chặng 9 Revolving Cross Paddle Wheels
      const wheels = [
        { x: 270, y: 5950, radius: 85, angle: state.wheelAngle1 },
        { x: 450, y: 5950, radius: 85, angle: state.wheelAngle2 }
      ];

      // Walls segments [x1, y1, x2, y2] - All 10 stages guide channels
      const walls = [
        // Outer track boundaries
        [0, 0, 0, 7100],
        [trackWidth, 0, trackWidth, 7100],

        // Chặng 1: Funnel out from gate & into Chặng 2
        [0, 190, 160, 240],
        [trackWidth, 190, trackWidth - 160, 240],
        [0, 620, 150, 700],
        [trackWidth, 620, trackWidth - 150, 700],

        // Chặng 2: Splitter lane funnels & divider wall
        [0, 750, 180, 880],
        [180, 880, 70, 1050],
        [trackWidth, 750, trackWidth - 180, 880],
        [trackWidth - 180, 880, trackWidth - 70, 1050],
        [360, 860, 360, 1280], // center divider
        [70, 1260, 240, 1370], // merge ramp left
        [trackWidth - 70, 1260, trackWidth - 240, 1370], // merge ramp right

        // Chặng 3: Rotating fans channel guide walls
        [0, 1420, 140, 1550],
        [trackWidth, 1420, trackWidth - 140, 1550],
        [140, 1550, 140, 1880],
        [trackWidth - 140, 1550, trackWidth - 140, 1880],
        [360, 1580, 360, 1880], // fan center divider
        [140, 1920, 260, 2040],
        [trackWidth - 140, 1920, trackWidth - 260, 2040],

        // Chặng 4: Pendulum hammer bottleneck
        [0, 2120, 200, 2280],
        [trackWidth, 2120, trackWidth - 200, 2280],
        [200, 2280, 200, 2620],
        [trackWidth - 200, 2280, trackWidth - 200, 2620],
        [200, 2620, 100, 2740],
        [trackWidth - 200, 2620, trackWidth - 100, 2740],

        // Chặng 5: Slingshot & Portal slide ramps
        [0, 2820, 520, 2960], // slides balls toward the portal inlet
        [0, 3040, 200, 3120],
        [trackWidth, 3040, trackWidth - 200, 3120],
        [200, 3120, 200, 3320],
        [trackWidth - 200, 3120, trackWidth - 200, 3320],

        // Chặng 6: Triple Zig-Zag Slalom Shelves
        [0, 3540, 570, 3690], // shelf 1 (gap on right)
        [trackWidth, 3750, 150, 3900], // shelf 2 (gap on left)
        [0, 3960, 570, 4110], // shelf 3 (gap on right)

        // Chặng 7: Seesaw channel guides
        [0, 4220, 180, 4350],
        [trackWidth, 4220, trackWidth - 180, 4350],
        [180, 4350, 180, 4820],
        [trackWidth - 180, 4350, trackWidth - 180, 4820],

        // Chặng 8: Galton pegboard funnel guides
        [0, 4920, 100, 5000],
        [trackWidth, 4920, trackWidth - 100, 5000],
        [100, 5000, 100, 5520],
        [trackWidth - 100, 5000, trackWidth - 100, 5520],

        // Chặng 9: 4-spoke paddle wheels channel
        [0, 5600, 160, 5720],
        [trackWidth, 5600, trackWidth - 160, 5720],
        [160, 5720, 160, 6180],
        [trackWidth - 160, 5720, trackWidth - 160, 6180],

        // Chặng 10: Grand Whirlpool Funnel to single-lane finish
        [0, 6300, 220, 6540],
        [trackWidth, 6300, trackWidth - 220, 6540],
        [220, 6540, 310, 6760],
        [trackWidth - 220, 6540, trackWidth - 310, 6760],
        // Finish lane neck (width 100px: 310 to 410)
        [310, 6760, 310, 6960],
        [410, 6760, 410, 6960],
        // Floor at bottom
        [310, 6960, 410, 6960]
      ];

      // --- SUBSTEPPED CONTINUOUS PHYSICS (Anti-tunneling & Smooth Momentum) ---
      const substeps = 3;
      const subDt = dt / substeps;
      const gravity = 240; // px/s^2 (Calibrated slower, suspenseful marble rolling)

      for (let step = 0; step < substeps; step++) {
        // Find current lead Y for pack racing dynamics
        let currentLeadY = 0;
        balls.forEach(b => {
          if (!b.isFinished && b.y > currentLeadY) currentLeadY = b.y;
        });

        // 1. Pack Racing Slipstream & Rubber-Banding
        balls.forEach(ball => {
          if (ball.isFinished) return;

          // Slipstream (Drafting behind marble directly ahead in close proximity)
          let hasSlipstream = false;
          for (let oi = 0; oi < balls.length; oi++) {
            const ob = balls[oi];
            if (ob.id !== ball.id && !ob.isFinished && ob.y > ball.y && ob.y - ball.y < 160) {
              if (Math.abs(ob.x - ball.x) < 45) {
                hasSlipstream = true;
                break;
              }
            }
          }
          if (hasSlipstream) {
            ball.vy += 75 * subDt; // Slipstream draft boost!
          }

          // Trailing pack rubber-band catchup (keeps the race close and thrilling!)
          const lagDistance = currentLeadY - ball.y;
          if (lagDistance > 380) {
            ball.vy += 45 * subDt;
          }

          // Runaway leader headwind drag (prevents one marble from winning early)
          if (ball.y === currentLeadY && currentLeadY > 400) {
            let secondLeadY = 0;
            balls.forEach(b => {
              if (b.id !== ball.id && !b.isFinished && b.y > secondLeadY) {
                secondLeadY = b.y;
              }
            });
            if (currentLeadY - secondLeadY > 200) {
              ball.vy *= (1 - 0.08 * subDt);
            }
          }
        });

        // 2. Individual Ball Physics & Collisions
        balls.forEach(ball => {
          if (ball.isFinished) return;

          // Apply Gravity
          ball.vy += gravity * subDt;

          // Air Drag
          ball.vx *= (1 - 0.12 * subDt);
          ball.vy *= (1 - 0.03 * subDt);

          // Speed Cap
          const speed = Math.hypot(ball.vx, ball.vy);
          const maxSpeed = 540;
          if (speed > maxSpeed) {
            ball.vx = (ball.vx / speed) * maxSpeed;
            ball.vy = (ball.vy / speed) * maxSpeed;
          }

          // Starting gate collision
          if (!gateOpen) {
            if (ball.y + ball.radius >= state.gateY && ball.y - ball.radius <= state.gateY + 14) {
              ball.y = state.gateY - ball.radius;
              ball.vy = -ball.vy * 0.1;
            }
          }

          // Bumper collisions
          bumpers.forEach(b => {
            const dx = ball.x - b.x;
            const dy = ball.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist < ball.radius + b.r) {
              const nx = dx / dist;
              const ny = dy / dist;
              const impulse = 260;
              ball.vx = nx * impulse + (Math.random() - 0.5) * 45;
              ball.vy = ny * impulse;
              ball.x = b.x + nx * (ball.radius + b.r + 1.5);
              playSynthSound('bumper');
            }
          });

          // Galton Pegs collisions (Chặng 8)
          galtonPegs.forEach(peg => {
            const dx = ball.x - peg.x;
            const dy = ball.y - peg.y;
            const dist = Math.hypot(dx, dy);
            if (dist < ball.radius + peg.r) {
              const nx = dx / dist;
              const ny = dy / dist;
              const impulse = 160;
              ball.vx = nx * impulse + (Math.random() - 0.5) * 50;
              ball.vy = Math.max(15, ny * impulse);
              ball.x = peg.x + nx * (ball.radius + peg.r + 1);
              playSynthSound('bumper');
            }
          });

          // Fork wedge collision (Chặng 2)
          if (ball.y >= forkArrowTip.y && ball.y <= forkArrowBase.y) {
            const arrowHalfWidth = 14 + (ball.y - forkArrowTip.y) * 0.16;
            if (Math.abs(ball.x - 360) < arrowHalfWidth + ball.radius) {
              if (ball.x < 360) {
                ball.x = 360 - arrowHalfWidth - ball.radius;
                ball.vx = -Math.abs(ball.vx) * 0.65 - 40;
              } else {
                ball.x = 360 + arrowHalfWidth + ball.radius;
                ball.vx = Math.abs(ball.vx) * 0.65 + 40;
              }
            }
          }

          // Rotating Fans collision (Chặng 3)
          fans.forEach(fan => {
            const dx = ball.x - fan.x;
            const dy = ball.y - fan.y;
            const dist = Math.hypot(dx, dy);
            if (dist < fan.radius + ball.radius) {
              for (let b = 0; b < 3; b++) {
                const bAngle = fan.angle + (b * Math.PI * 2) / 3;
                const bx = Math.cos(bAngle);
                const by = Math.sin(bAngle);
                const dot = dx * bx + dy * by;
                if (dot > 0 && dot < fan.radius) {
                  const perpDist = Math.abs(-by * dx + bx * dy);
                  if (perpDist < ball.radius + 12) {
                    const bladeSpeed = fan.radius * 2.0;
                    ball.vx += -by * bladeSpeed * 0.65 + (Math.random() - 0.5) * 60;
                    ball.vy += bx * bladeSpeed * 0.65 + 50;
                    playSynthSound('fanHit');
                    break;
                  }
                }
              }
            }
          });

          // Swinging Pendulum collision (Chặng 4)
          const pdx = ball.x - pendulumBob.x;
          const pdy = ball.y - pendulumBob.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < ball.radius + pendulumBob.radius) {
            const nx = pdx / pdist;
            const ny = pdy / pdist;
            ball.vx += nx * 280;
            ball.vy += ny * 280;
            ball.x = pendulumBob.x + nx * (ball.radius + pendulumBob.radius + 2);
            playSynthSound('bumper');
          }

          // Wormhole Portal A -> B (Chặng 5)
          const portDist = Math.hypot(ball.x - portalIn.x, ball.y - portalIn.y);
          if (portDist < portalIn.r + ball.radius) {
            ball.x = portalOut.x;
            ball.y = portalOut.y;
            ball.vx = 130;
            ball.vy = 70;
            playSynthSound('boost');
            addCommentary(`🌀 ${ball.name} lọt hố sâu không gian nhảy vọt ngoạn mục!`, elapsedTime);
          }

          // Speed Boost Pad collision (Chặng 5)
          if (
            ball.x >= boostPad.x && ball.x <= boostPad.x + boostPad.w &&
            ball.y >= boostPad.y && ball.y <= boostPad.y + boostPad.h
          ) {
            ball.vx += boostPad.boostVx;
            ball.vy += boostPad.boostVy;
            playSynthSound('boost');
          }

          // Tilting Seesaw Planks collision (Chặng 7)
          seesaws.forEach(sw => {
            const wx = sw.p2.x - sw.p1.x;
            const wy = sw.p2.y - sw.p1.y;
            const wlen2 = wx * wx + wy * wy;
            if (wlen2 > 0) {
              let t = ((ball.x - sw.p1.x) * wx + (ball.y - sw.p1.y) * wy) / wlen2;
              t = Math.max(0, Math.min(1, t));
              const cx = sw.p1.x + t * wx;
              const cy = sw.p1.y + t * wy;
              const cdist = Math.hypot(ball.x - cx, ball.y - cy);
              if (cdist < ball.radius + 7) {
                const nx = cdist === 0 ? 0 : (ball.x - cx) / cdist;
                const ny = cdist === 0 ? -1 : (ball.y - cy) / cdist;
                ball.x = cx + nx * (ball.radius + 7.5);
                ball.y = cy + ny * (ball.radius + 7.5);
                const dot = ball.vx * nx + ball.vy * ny;
                if (dot < 0) {
                  ball.vx -= 1.45 * dot * nx;
                  ball.vy -= 1.45 * dot * ny;
                }
                playSynthSound('bumper');
              }
            }
          });

          // Revolving Cross Paddle Wheels collision (Chặng 9)
          wheels.forEach(wh => {
            const dx = ball.x - wh.x;
            const dy = ball.y - wh.y;
            const dist = Math.hypot(dx, dy);
            if (dist < wh.radius + ball.radius) {
              for (let s = 0; s < 4; s++) {
                const sAngle = wh.angle + (s * Math.PI) / 2;
                const sx = Math.cos(sAngle);
                const sy = Math.sin(sAngle);
                const dot = dx * sx + dy * sy;
                if (dot > 0 && dot < wh.radius) {
                  const perpDist = Math.abs(-sy * dx + sx * dy);
                  if (perpDist < ball.radius + 10) {
                    const paddleSpeed = wh.radius * 1.9;
                    ball.vx += -sy * paddleSpeed * 0.7 + (Math.random() - 0.5) * 50;
                    ball.vy += sx * paddleSpeed * 0.7 + 60;
                    playSynthSound('fanHit');
                    break;
                  }
                }
              }
            }
          });

          // Walls Collision (Robust Segment Distance)
          walls.forEach(([x1, y1, x2, y2]) => {
            const wx = x2 - x1;
            const wy = y2 - y1;
            const wlen2 = wx * wx + wy * wy;
            if (wlen2 === 0) return;

            let t = ((ball.x - x1) * wx + (ball.y - y1) * wy) / wlen2;
            t = Math.max(0, Math.min(1, t));
            const cx = x1 + t * wx;
            const cy = y1 + t * wy;
            const cdx = ball.x - cx;
            const cdy = ball.y - cy;
            const cdist = Math.hypot(cdx, cdy);

            if (cdist < ball.radius) {
              const nx = cdist === 0 ? 0 : cdx / cdist;
              const ny = cdist === 0 ? -1 : cdy / cdist;
              ball.x = cx + nx * (ball.radius + 0.5);
              ball.y = cy + ny * (ball.radius + 0.5);

              const dot = ball.vx * nx + ball.vy * ny;
              if (dot < 0) {
                const restitution = 0.52;
                ball.vx = ball.vx - (1 + restitution) * dot * nx;
                ball.vy = ball.vy - (1 + restitution) * dot * ny;

                // Slide friction
                const tx = -ny;
                const ty = nx;
                const tdot = ball.vx * tx + ball.vy * ty;
                ball.vx = tx * tdot * 0.94 + nx * Math.max(0, -dot * restitution);
                ball.vy = ty * tdot * 0.94 + ny * Math.max(0, -dot * restitution);
              }
            }
          });

          // Position Integration
          ball.x += ball.vx * subDt;
          ball.y += ball.vy * subDt;

          // Track Boundaries
          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.5;
          }
          if (ball.x + ball.radius > trackWidth) {
            ball.x = trackWidth - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.5;
          }

          // Finish Line Check
          if (ball.y >= finishY && !ball.isFinished) {
            ball.isFinished = true;
            ball.finishTime = elapsedTime;
            state.finishedBalls.push(ball);

            if (state.finishedBalls.length === 1) {
              setWinner(ball);
              setGameState('finished');
              playSynthSound('win');
              confetti({
                particleCount: 140,
                spread: 85,
                origin: { y: 0.6 }
              });
              setTimeout(() => {
                setShowWinnerModal(true);
              }, 600);
              addCommentary(`🏆 ${ball.name} CÁN ĐÍCH ĐẦU TIÊN (VỀ NHẤT)!`, elapsedTime);
            } else {
              addCommentary(`${ball.name} về đích hạng ${state.finishedBalls.length}.`, elapsedTime);
            }
          }
        });

        // 3. Ball-to-Ball Elastic Collisions with Pack Jostling Momentum
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i];
            const b2 = balls[j];
            if (b1.isFinished && b2.isFinished) continue;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = b1.radius + b2.radius;
            if (dist < minDist && dist > 0) {
              const overlap = 0.5 * (minDist - dist);
              const nx = dx / dist;
              const ny = dy / dist;
              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
              b2.x += nx * overlap;
              b2.y += ny * overlap;

              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = (2 * (nx * kx + ny * ky)) / 2;
              b1.vx -= p * nx * 0.85;
              b1.vy -= p * ny * 0.85;
              b2.vx += p * nx * 0.85;
              b2.vy += p * ny * 0.85;

              // Lateral jostling impulse so marbles constantly jockey for position
              const lateralKick = (Math.random() - 0.5) * 16;
              b1.vx += lateralKick;
              b2.vx -= lateralKick;
            }
          }
        }
      }

      // Smooth Camera tracking target (Tracks lead pack closely)
      const unfinishedBalls = balls.filter(b => !b.isFinished);
      let targetCameraY = 0;
      if (unfinishedBalls.length > 0) {
        const sorted = [...unfinishedBalls].sort((a, b) => b.y - a.y);
        const topY = sorted[0].y;
        targetCameraY = Math.max(0, topY - 320);
      } else if (state.finishedBalls.length > 0) {
        targetCameraY = finishY - 360;
      }
      state.cameraY += (targetCameraY - state.cameraY) * 0.08;

      // Update Current Stage Name
      const leadY = state.cameraY + 340;
      const currentStage = STAGES.find(s => leadY >= s.startY && leadY < s.endY) || STAGES[STAGES.length - 1];
      if (currentStage && currentStage.name !== currentStageName) {
        setCurrentStageName(currentStage.name);
      }

      // Update Leaderboard & detect overtakes
      const ranked = [...balls].sort((a, b) => {
        if (a.isFinished && b.isFinished) return a.finishTime - b.finishTime;
        if (a.isFinished) return -1;
        if (b.isFinished) return 1;
        return b.y - a.y;
      });

      ranked.forEach((b, idx) => {
        b.rank = idx + 1;
      });
      setLeaderboard(ranked);

      // Periodically check dramatic overtakes for commentary
      if (currentTime - state.lastCommentaryTime > 2200 && gameState === 'racing') {
        state.lastCommentaryTime = currentTime;
        if (state.previousRankings.length === ranked.length) {
          for (let i = 0; i < Math.min(6, ranked.length); i++) {
            const currentBall = ranked[i];
            const prevIdx = state.previousRankings.findIndex(p => p.id === currentBall.id);
            if (prevIdx !== -1 && prevIdx - i >= 3) {
              const overtakes = prevIdx - i;
              addCommentary(`🔥 ${currentBall.name} bứt tốc ngoạn mục vượt liền ${overtakes} bạn!`, elapsedTime);
              break;
            }
          }
        }
        state.previousRankings = ranked.map(b => ({ id: b.id, rank: b.rank }));
      }

      // --- Draw Main Arena Canvas ---
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const viewW = canvas.width;
        const viewH = canvas.height;

        ctx.clearRect(0, 0, viewW, viewH);

        // White background with subtle grid lines
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, viewW, viewH);

        ctx.save();
        ctx.translate(0, -state.cameraY);

        // Draw background grid
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        const gridStep = 40;
        const startGridY = Math.floor(state.cameraY / gridStep) * gridStep;
        for (let y = startGridY; y < state.cameraY + viewH + gridStep; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(trackWidth, y);
          ctx.stroke();
        }
        for (let x = 0; x < trackWidth; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, state.cameraY);
          ctx.lineTo(x, state.cameraY + viewH);
          ctx.stroke();
        }

        // Draw Stage Floating Section Titles
        ctx.textAlign = 'center';
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94a3b8';
        STAGES.forEach(s => {
          ctx.fillText(s.name, trackWidth / 2, s.startY + 45);
        });

        // Draw Starting Gate Bar
        ctx.fillStyle = '#1e293b';
        if (!gateOpen) {
          ctx.fillRect(60, state.gateY, trackWidth - 120, 16);
          // Yellow safety stripes
          ctx.fillStyle = '#f59e0b';
          for (let x = 80; x < trackWidth - 100; x += 40) {
            ctx.fillRect(x, state.gateY + 2, 20, 12);
          }
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - state.gateOffset / 200);
          ctx.fillRect(60 - state.gateOffset, state.gateY, (trackWidth - 120) / 2, 16);
          ctx.fillRect(trackWidth / 2 + state.gateOffset, state.gateY, (trackWidth - 120) / 2, 16);
          ctx.restore();
        }

        // Draw Track Walls
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        walls.forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        // Draw Chặng 2 Fork Arrow Wedge
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(forkArrowTip.x, forkArrowTip.y);
        ctx.lineTo(forkArrowTip.x - 26, forkArrowTip.y + 55);
        ctx.lineTo(forkArrowTip.x - 12, forkArrowTip.y + 55);
        ctx.lineTo(forkArrowTip.x - 12, forkArrowBase.y);
        ctx.lineTo(forkArrowTip.x + 12, forkArrowBase.y);
        ctx.lineTo(forkArrowTip.x + 12, forkArrowTip.y + 55);
        ctx.lineTo(forkArrowTip.x + 26, forkArrowTip.y + 55);
        ctx.closePath();
        ctx.fill();

        // Draw Chặng 3 Rotating Propeller Fans
        fans.forEach(fan => {
          ctx.save();
          ctx.translate(fan.x, fan.y);
          ctx.rotate(fan.angle);

          // 3 blades
          ctx.fillStyle = '#f97316';
          for (let b = 0; b < 3; b++) {
            ctx.save();
            ctx.rotate((b * Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.roundRect(0, -11, fan.radius, 22, 10);
            ctx.fill();
            ctx.restore();
          }

          // Center dark hub
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Draw Chặng 4 Swinging Pendulum
        ctx.save();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pendulumPivot.x, pendulumPivot.y);
        ctx.lineTo(pendulumBob.x, pendulumBob.y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(pendulumBob.x, pendulumBob.y, pendulumBob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(pendulumBob.x, pendulumBob.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Chặng 5 Speed Boost Pad
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(boostPad.x, boostPad.y, boostPad.w, boostPad.h, 12);
        ctx.fill();
        ctx.stroke();
        // Speed chevron arrows
        ctx.fillStyle = '#eab308';
        for (let i = 0; i < 5; i++) {
          const ax = boostPad.x + 35 + i * 48;
          const ay = boostPad.y + boostPad.h / 2;
          ctx.beginPath();
          ctx.moveTo(ax - 10, ay - 12);
          ctx.lineTo(ax + 8, ay);
          ctx.lineTo(ax - 10, ay + 12);
          ctx.lineTo(ax - 2, ay);
          ctx.closePath();
          ctx.fill();
        }

        // Draw Chặng 5 Wormhole Portals
        // Portal In (Cyan Vortex)
        ctx.save();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(portalIn.x, portalIn.y, portalIn.r + Math.sin(currentTime * 0.01) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fill();
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#0891b2';
        ctx.fillText('🌀 CỔNG VÀO', portalIn.x, portalIn.y - 32);

        // Portal Out (Purple Vortex)
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(portalOut.x, portalOut.y, portalOut.r + Math.sin(currentTime * 0.01) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.fill();
        ctx.fillStyle = '#7e22ce';
        ctx.fillText('🌀 CỔNG RA', portalOut.x, portalOut.y - 32);
        ctx.restore();

        // Draw Chặng 6 Rumble Strips on Slalom Shelves
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        for (let sx = 60; sx < 520; sx += 30) {
          ctx.beginPath();
          ctx.moveTo(sx, 3550 + (sx / 570) * 140);
          ctx.lineTo(sx + 10, 3550 + (sx / 570) * 140 - 10);
          ctx.stroke();
        }
        for (let sx = 200; sx < 660; sx += 30) {
          ctx.beginPath();
          ctx.moveTo(sx, 3880 - ((sx - 150) / 570) * 140);
          ctx.lineTo(sx + 10, 3880 - ((sx - 150) / 570) * 140 - 10);
          ctx.stroke();
        }

        // Draw Chặng 7 Tilting Seesaws
        seesaws.forEach((sw, sIdx) => {
          ctx.save();
          // Support pivot triangle
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.moveTo(sw.px, sw.py);
          ctx.lineTo(sw.px - 14, sw.py + 20);
          ctx.lineTo(sw.px + 14, sw.py + 20);
          ctx.closePath();
          ctx.fill();

          // Tilting plank
          ctx.strokeStyle = sIdx === 0 ? '#3b82f6' : '#8b5cf6';
          ctx.lineWidth = 10;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sw.p1.x, sw.p1.y);
          ctx.lineTo(sw.p2.x, sw.p2.y);
          ctx.stroke();

          // Pivot center pin
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(sw.px, sw.py, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Draw Chặng 8 Galton Pegs (Small dark steel pins)
        ctx.fillStyle = '#334155';
        galtonPegs.forEach(peg => {
          ctx.beginPath();
          ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Chặng 9 Revolving Cross Paddle Wheels
        wheels.forEach((wh, wIdx) => {
          ctx.save();
          ctx.translate(wh.x, wh.y);
          ctx.rotate(wh.angle);

          // 4 perpendicular spokes
          ctx.fillStyle = wIdx === 0 ? '#06b6d4' : '#10b981';
          for (let s = 0; s < 4; s++) {
            ctx.save();
            ctx.rotate((s * Math.PI) / 2);
            ctx.beginPath();
            ctx.roundRect(0, -9, wh.radius, 18, 8);
            ctx.fill();
            ctx.restore();
          }

          // Center dark hub
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Draw Bumpers (Red concentric circles)
        bumpers.forEach(b => {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * 0.65, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Finish Line Sensor (Chặng 10)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 6;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.moveTo(310, finishY);
        ctx.lineTo(410, finishY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#16a34a';
        ctx.fillText('🏁 VẠCH ĐÍCH', 360, finishY - 14);

        // Draw Balls with Name Labels & Numbers
        balls.forEach(ball => {
          ctx.save();

          // Top 1 leader aura halo
          if (ball.rank === 1 && !ball.isFinished && gameState === 'racing') {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius + 8, 0, Math.PI * 2);
            ctx.fill();
          }

          // Main Ball Circle
          ctx.fillStyle = ball.color;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.fill();

          // Ball border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Ball Number
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(ball.number), ball.x, ball.y);

          // Student Name Pill above ball
          const pillName = ball.name.split(' ').slice(-2).join(' ');
          ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
          const textWidth = ctx.measureText(pillName).width;
          const pillH = 18;
          const pillW = textWidth + 14;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          ctx.roundRect(ball.x - pillW / 2, ball.y - ball.radius - 22, pillW, pillH, 9);
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.fillText(pillName, ball.x, ball.y - ball.radius - 12);

          ctx.restore();
        });

        ctx.restore();
      }

      // --- Draw Minimap Canvas ---
      const minimap = minimapCanvasRef.current;
      if (minimap) {
        const mctx = minimap.getContext('2d');
        const mw = minimap.width;
        const mh = minimap.height;
        mctx.clearRect(0, 0, mw, mh);

        const scaleY = mh / totalHeight;
        const scaleX = mw / trackWidth;

        // Minimap background
        mctx.fillStyle = '#ffffff';
        mctx.fillRect(0, 0, mw, mh);

        // Minimap outline
        mctx.strokeStyle = '#cbd5e1';
        mctx.lineWidth = 1.5;
        mctx.strokeRect(0, 0, mw, mh);

        // Draw track simplified walls
        mctx.strokeStyle = '#1e293b';
        mctx.lineWidth = 1.5;
        walls.forEach(([x1, y1, x2, y2]) => {
          mctx.beginPath();
          mctx.moveTo(x1 * scaleX, y1 * scaleY);
          mctx.lineTo(x2 * scaleX, y2 * scaleY);
          mctx.stroke();
        });

        // Draw finish funnel target (Yellow circle at bottom)
        mctx.fillStyle = '#fde047';
        mctx.beginPath();
        mctx.arc(mw / 2, finishY * scaleY, 10, 0, Math.PI * 2);
        mctx.fill();

        // Draw balls on minimap as tiny colored dots
        balls.forEach(b => {
          mctx.fillStyle = b.color;
          mctx.beginPath();
          mctx.arc(b.x * scaleX, b.y * scaleY, 2.5, 0, Math.PI * 2);
          mctx.fill();
        });

        // Draw Red Viewport Box
        const viewH = canvasRef.current ? canvasRef.current.height : 700;
        const boxY = state.cameraY * scaleY;
        const boxH = viewH * scaleY;
        mctx.strokeStyle = '#f43f5e';
        mctx.lineWidth = 2.5;
        mctx.strokeRect(2, boxY, mw - 4, boxH);
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [simSpeed, gameState, currentStageName]);

  // Handle Score Award
  const handleScoreChange = (delta) => {
    setAwardedPoints(prev => {
      const next = prev + delta;
      if (onAddPoints && winner) {
        onAddPoints(winner.name, delta);
      }
      return next;
    });
  };

  // Lucky card drawer
  const handleDrawLuckyCard = () => {
    const CARDS = [
      '⭐ Cộng 2 điểm vào sổ điểm tiết học!',
      '🎁 Nhận một tràng pháo tay siêu lớn từ cả lớp!',
      '🛡️ Khiên miễn trừ câu hỏi khó kế tiếp!',
      '👑 Trở thành trợ lý giúp Thầy/Cô điều khiển game tiếp theo!',
      '🍬 Nhận một phần quà bí mật từ Thầy/Cô!'
    ];
    const picked = CARDS[Math.floor(Math.random() * CARDS.length)];
    setLuckyCard(picked);
    setShowLuckyCardModal(true);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* 1. Header Toolbar matching video finish_62s.jpg */}
      <div style={{
        height: '56px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 50
      }}>
        {/* Title & Class Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
            padding: '6px 12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 900,
            fontSize: '1rem',
            color: '#ffffff',
            boxShadow: '0 2px 10px rgba(244, 63, 94, 0.4)'
          }}>
            🏁 Đua Bi
            <span style={{
              background: '#be123c',
              fontSize: '0.72rem',
              padding: '2px 6px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              VỀ NHẤT LÊN BẢNG
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1e293b',
            padding: '4px 12px',
            borderRadius: '10px',
            border: '1px solid #334155'
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Lớp:</span>
            <strong style={{ color: '#38bdf8', fontSize: '0.92rem' }}>{selectedClassName}</strong>
            <span style={{
              background: '#0f172a',
              color: '#a5f3fc',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              {students.length} HS
            </span>
          </div>

          {/* Button 1: Nhập nhanh danh sách lớp chủ nhiệm */}
          <button
            onClick={loadStudents}
            title="Nhập nhanh danh sách từ Lớp Chủ Nhiệm"
            style={{
              background: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              padding: '6px 13px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} />
            DS Lớp Chủ Nhiệm
          </button>

          {/* Button 2: Khung nhập danh sách học sinh theo mong muốn */}
          <button
            onClick={handleOpenRosterModal}
            title="Mở khung nhập danh sách học sinh theo mong muốn"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
              color: '#ffffff',
              border: '1px solid #34d399',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(5, 150, 105, 0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            <Edit3 size={15} />
            Khung Nhập DS Theo Mong Muốn
          </button>
        </div>

        {/* Controls: Speed, Sync, Sound, Fullscreen, Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Speed selector */}
          <div style={{
            background: '#1e293b',
            padding: '3px 6px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '0 6px' }}>
              TỐC ĐỘ:
            </span>
            {[0.5, 0.75, 1, 1.5, 2, 3].map(spd => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                style={{
                  background: simSpeed === spd ? '#ef4444' : 'transparent',
                  color: simSpeed === spd ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {spd}X
              </button>
            ))}
          </div>

          {/* Sync Homeroom button */}
          <button
            onClick={loadStudents}
            title="Đồng bộ lại danh sách từ Lớp Chủ Nhiệm"
            style={{
              background: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            Lớp Chủ Nhiệm
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Reset Race */}
          <button
            onClick={initRace}
            title="Khởi tạo cuộc đua mới"
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={15} />
            Đua Lại
          </button>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main 3-Column Arena Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* COLUMN 1: LEFT LEADERBOARD (21%) */}
        <div style={{
          width: '21%',
          minWidth: '250px',
          background: '#ffffff',
          color: '#0f172a',
          borderRight: '1.5px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 16px rgba(0,0,0,0.06)',
          zIndex: 20
        }}>
          {/* Live Indicator & Timer Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ef4444', letterSpacing: '0.6px' }}>
                TRỰC TIẾP
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', letterSpacing: '-1px' }}>
              {formatTime(elapsedTime)}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginTop: '4px', textTransform: 'uppercase' }}>
              BẢNG XẾP HẠNG
            </div>
          </div>

          {/* Scrollable Leaderboard List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            {leaderboard.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  marginBottom: '6px',
                  background: idx === 0 ? '#fefce8' : (idx < 3 ? '#f8fafc' : '#ffffff'),
                  border: idx === 0 ? '1.5px solid #facc15' : '1px solid #f1f5f9',
                  transition: 'all 0.2s ease',
                  boxShadow: idx === 0 ? '0 2px 8px rgba(250, 204, 21, 0.25)' : 'none'
                }}
              >
                {/* Rank Number */}
                <span style={{
                  width: '24px',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: idx === 0 ? '#ca8a04' : (idx < 3 ? '#0f172a' : '#94a3b8'),
                  textAlign: 'center',
                  marginRight: '6px'
                }}>
                  {idx + 1}
                </span>

                {/* Ball Number Badge */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: item.color,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}>
                  {item.number}
                </div>

                {/* Avatar / Monogram */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  color: '#334155',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  overflow: 'hidden'
                }}>
                  {item.avatar ? (
                    <img src={item.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(item.name)
                  )}
                </div>

                {/* Student Full Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </div>
                  {item.isFinished && (
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                      Về đích: {formatTime(item.finishTime)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: CENTER ARENA CANVAS (58%) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: '#f8fafc'
        }}>
          {/* Top Floating Stage Indicator Pill */}
          <div style={{
            position: 'absolute',
            top: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            padding: '8px 24px',
            borderRadius: '24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: '0.92rem',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#ef4444' }}>●</span>
            {currentStageName}
          </div>

          {/* Main Race Canvas */}
          <canvas
            ref={canvasRef}
            width={720}
            height={window.innerHeight - 56}
            style={{
              width: '720px',
              height: '100%',
              display: 'block',
              background: '#ffffff',
              boxShadow: '0 0 30px rgba(0,0,0,0.06)'
            }}
          />

          {/* STARTING GATE LOCK MODAL (Matching video frame_00_0s.jpg) */}
          {gameState === 'gate_locked' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#1a1f2e',
              border: '1.5px solid #2e3748',
              borderRadius: '24px',
              padding: '28px 36px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              zIndex: 40,
              width: '460px',
              textAlign: 'center',
              color: '#ffffff'
            }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 800,
                marginBottom: '10px'
              }}>
                🔒 THANH GẠT CHẮN BI ĐANG KHÓA
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#facc15', margin: '4px 0 20px 0' }}>
                TÍN HIỆU XUẤT PHÁT · MỞ THANH GẠT
              </h3>

              {/* 4 Step Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => handleStepClick(num)}
                    style={{
                      background: gateStep >= num ? '#ef4444' : '#232b3e',
                      border: '1.5px solid',
                      borderColor: gateStep >= num ? '#f87171' : '#334155',
                      borderRadius: '16px',
                      padding: '12px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: gateStep >= num ? '0 4px 12px rgba(239, 68, 68, 0.4)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: gateStep >= num ? '#ffffff' : '#0f172a',
                      color: gateStep >= num ? '#ef4444' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1rem'
                    }}>
                      {num}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: gateStep >= num ? '#ffffff' : '#94a3b8', fontWeight: 700 }}>
                      {num === 4 ? 'Nút 4 (Mở)' : `Nút ${num}`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Big Red Space Start Button & Quick Start */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <button
                  onClick={handleAutoCountdown}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '14px',
                    fontWeight: 900,
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Play size={18} fill="#ffffff" />
                  TỰ ĐỘNG ĐẾM 1-2-3-4 (SPACE)
                </button>

                <button
                  onClick={triggerStartRace}
                  style={{
                    background: '#232b3e',
                    border: '1px solid #3b82f6',
                    color: '#60a5fa',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Zap size={16} />
                  Mở ngay
                </button>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Bấm các nút 1 → 2 → 3 → 4 hoặc gõ phím 1, 2, 3, 4 trên bàn phím
              </div>

              {/* Quick Roster Switching Actions inside Start Modal */}
              <div style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={loadStudents}
                  title="Nhập nhanh danh sách lớp chủ nhiệm"
                  style={{
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #38bdf8',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <RefreshCw size={14} />
                  Nhập nhanh DS Lớp Chủ Nhiệm
                </button>
                <button
                  onClick={handleOpenRosterModal}
                  title="Mở khung nhập danh sách học sinh theo mong muốn"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: '1px solid #34d399',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
                  }}
                >
                  <Edit3 size={14} />
                  Khung Nhập DS Theo Mong Muốn
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 3: RIGHT MINIMAP & COMMENTARY FEED (21%) */}
        <div style={{
          width: '21%',
          minWidth: '240px',
          background: '#ffffff',
          color: '#0f172a',
          borderLeft: '1.5px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
          zIndex: 20
        }}>
          {/* Top: Minimap */}
          <div style={{ padding: '16px 18px 12px 18px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase' }}>
              TOÀN ĐƯỜNG ĐUA
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={minimapCanvasRef}
                width={170}
                height={260}
                style={{
                  width: '170px',
                  height: '260px',
                  borderRadius: '12px',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>

          {/* Bottom: Commentary Live Feed */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '12px 18px 8px 18px', fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
              DIỄN BIẾN
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}>
              {commentaryLog.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    marginBottom: '6px',
                    fontSize: '0.82rem',
                    lineHeight: '1.35',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <span style={{ color: '#ef4444', fontWeight: 800, marginRight: '6px', fontFamily: 'monospace' }}>
                    {item.time}
                  </span>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. WINNER MODAL: "VỀ NHẤT - MỜI LÊN BẢNG" (Matching video finish_58s.jpg) */}
      {showWinnerModal && winner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '28px',
            padding: '36px 44px',
            width: '560px',
            textAlign: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
            animation: 'scaleUp 0.3s ease-out'
          }}>
            {/* Top Yellow Ribbon Banner */}
            <div style={{
              display: 'inline-block',
              background: '#fde047',
              color: '#854d0e',
              padding: '6px 20px',
              borderRadius: '20px',
              fontWeight: 900,
              fontSize: '0.9rem',
              letterSpacing: '0.6px',
              marginBottom: '20px'
            }}>
              VỀ NHẤT – MỜI LÊN BẢNG
            </div>

            {/* Winner Ball Avatar / Badges */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: winner.color,
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }}>
                {winner.number}
              </div>

              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '1.25rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                {winner.avatar ? (
                  <img src={winner.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(winner.name)
                )}
              </div>
            </div>

            {/* Winner Big Name */}
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 4px 0', color: '#0f172a', letterSpacing: '-0.5px' }}>
              {winner.name.toUpperCase()}
            </h1>
            <div style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 600, marginBottom: '22px' }}>
              {winner.name}
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>STT</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{winner.number}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>Về đích sau</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  {winner.finishTime ? winner.finishTime.toFixed(2) : '41.71'} giây
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>Hơn bạn tiếp theo</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>1.28 giây</div>
              </div>
            </div>

            {/* Quick Scoring +/- 1 điểm */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <button
                onClick={() => handleScoreChange(-1)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#475569',
                  padding: '10px 22px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                −1 điểm
              </button>
              <button
                onClick={() => handleScoreChange(1)}
                style={{
                  background: '#1e293b',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(30, 41, 59, 0.3)'
                }}
              >
                +1 điểm
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700, marginBottom: '24px' }}>
              Điểm cộng tích lũy hiện tại: <strong style={{ color: awardedPoints > 0 ? '#16a34a' : '#0f172a' }}>{awardedPoints}</strong>
            </div>

            {/* Action Tools: Đồng hồ trả lời, Thẻ vận may, Kết quả toàn đoàn, Đua lại */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <button
                onClick={() => { setShowTimerModal(true); setTimerActive(true); }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '10px 6px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                ⏱ Đồng hồ trả lời
              </button>

              <button
                onClick={handleDrawLuckyCard}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '10px 6px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                🎴 Thẻ vận may
              </button>

              <button
                onClick={() => setShowFullStandingsModal(true)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '10px 6px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                📋 Toàn đoàn
              </button>

              <button
                onClick={() => { setShowWinnerModal(false); initRace(); }}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  padding: '10px 6px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                🔄 Đua tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ANSWER COUNTDOWN TIMER MODAL */}
      {showTimerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120
        }}>
          <div style={{
            background: '#0f172a',
            border: '2px solid #334155',
            borderRadius: '24px',
            padding: '36px 48px',
            textAlign: 'center',
            color: '#ffffff',
            width: '400px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '14px', color: '#facc15' }}>
              ⏱ ĐỒNG HỒ TRẢ LỜI CÂU HỎI
            </h3>
            <div style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: timerSecondsLeft <= 5 ? '#ef4444' : '#38bdf8',
              marginBottom: '20px'
            }}>
              {timerSecondsLeft}s
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {[15, 30, 60].map(sec => (
                <button
                  key={sec}
                  onClick={() => setTimerSecondsLeft(sec)}
                  style={{
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #475569',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {sec}s
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTimerModal(false)}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              Đóng đồng hồ
            </button>
          </div>
        </div>
      )}

      {/* 5. LUCKY CARD MODAL */}
      {showLuckyCardModal && luckyCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '24px',
            padding: '36px 40px',
            textAlign: 'center',
            color: '#ffffff',
            width: '450px',
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🎴</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#facc15', marginBottom: '16px' }}>
              THẺ VẬN MAY HỌC ĐƯỜNG
            </h3>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '20px',
              borderRadius: '16px',
              fontSize: '1.15rem',
              fontWeight: 800,
              lineHeight: '1.5',
              color: '#fef08a',
              marginBottom: '24px',
              border: '1px dashed #f59e0b'
            }}>
              {luckyCard}
            </div>
            <button
              onClick={() => setShowLuckyCardModal(false)}
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '14px',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              Tuyệt Vời! Nhận Thưởng
            </button>
          </div>
        </div>
      )}

      {/* 6. FULL STANDINGS LEADERBOARD MODAL */}
      {showFullStandingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120
        }}>
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '24px',
            padding: '30px 36px',
            width: '600px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                📋 BẢNG TỔNG SẮP TOÀN ĐOÀN
              </h3>
              <button
                onClick={() => setShowFullStandingsModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
              {leaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    background: idx === 0 ? '#fefce8' : '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 900, width: '24px', color: idx === 0 ? '#ca8a04' : '#64748b' }}>
                      #{idx + 1}
                    </span>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: item.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900
                    }}>
                      {item.number}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>
                    {item.isFinished ? `${item.finishTime?.toFixed(2)}s` : 'Chưa về đích'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* 7. CUSTOM ROSTER INPUT MODAL */}
      {showRosterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 130,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            color: '#f8fafc',
            border: '2px solid #38bdf8',
            borderRadius: '24px',
            padding: '28px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: '#38bdf8',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Edit3 size={22} color="#34d399" />
                  KHUNG NHẬP DANH SÁCH HỌC SINH THEO MONG MUỐN
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Vẫn giữ nguyên danh sách lớp chủ nhiệm, thầy cô có thể nhập nhanh danh sách học sinh theo mong muốn (dán tên, chọn lớp mẫu hoặc tải file Excel) để bắt đầu cuộc đua bi.
                </p>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Class Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '6px' }}>
                🏷️ Tên Lớp / Nhóm Đua Theo Mong Muốn:
              </label>
              <input
                type="text"
                value={customClassNameInput}
                onChange={(e) => setCustomClassNameInput(e.target.value)}
                placeholder="Ví dụ: Lớp 10A1 Tuyển Chọn, Nhóm 1 Sinh Học, Đội Vàng..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: '#0f172a',
                  border: '1px solid #475569',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Quick Presets & File Upload */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0' }}>
                  ⚡ Chọn Nhanh Mẫu Danh Sách:
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Upload size={14} /> Tải tệp Excel (.xlsx)
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv,.txt"
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleLoadHomeroomPreset}
                  style={{
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1.5px solid #38bdf8',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🏫 Nạp Lớp Chủ Nhiệm
                </button>
                <button
                  onClick={() => handleLoadSamplePreset('Lớp 9A1 (Mẫu 24 HS)')}
                  style={{
                    background: '#334155',
                    color: '#e2e8f0',
                    border: '1px solid #475569',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  👥 Lớp 9A1 (24 HS)
                </button>
                <button
                  onClick={() => handleLoadSamplePreset('Lớp 10A2 (Mẫu 15 HS)')}
                  style={{
                    background: '#334155',
                    color: '#e2e8f0',
                    border: '1px solid #475569',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  👥 Lớp 10A2 (15 HS)
                </button>
                <button
                  onClick={() => handleLoadSamplePreset('Lớp 6A3 (Mẫu 10 HS)')}
                  style={{
                    background: '#334155',
                    color: '#e2e8f0',
                    border: '1px solid #475569',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  👥 Lớp 6A3 (10 HS)
                </button>
                <button
                  onClick={() => setCustomRosterText('')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} /> Xóa trắng để dán
                </button>
              </div>
            </div>

            {/* Textarea Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0' }}>
                  ✍️ Khung nhập danh sách học sinh theo mong muốn (mỗi dòng một học sinh):
                </span>
                <span style={{
                  background: customRosterText.split('\n').map(s => s.trim()).filter(Boolean).length >= 2 ? '#065f46' : '#831843',
                  color: customRosterText.split('\n').map(s => s.trim()).filter(Boolean).length >= 2 ? '#6ee7b7' : '#fbcfe8',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 900
                }}>
                  {customRosterText.split('\n').map(s => s.trim()).filter(Boolean).length} học sinh đã nhận diện
                </span>
              </div>

              <textarea
                rows={9}
                value={customRosterText}
                onChange={(e) => setCustomRosterText(e.target.value)}
                placeholder={'Nguyễn Văn An\nTrần Thị Bình\nLê Hoàng Nam\nPhan Quốc Bảo\n...'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#0f172a',
                  border: '1px solid #475569',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '0.92rem',
                  lineHeight: '1.6',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                💡 Mẹo: Thầy cô có thể copy cả cột học sinh từ bảng Excel, Word hoặc Zalo rồi dán trực tiếp vào đây.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                onClick={() => setShowRosterModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: '1px solid #64748b',
                  color: '#cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleApplyCustomRoster}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                }}
              >
                <Check size={18} /> Áp Dụng Danh Sách & Bắt Đầu Đua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
