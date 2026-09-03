import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Volume2, VolumeX, Maximize, Settings, ArrowLeft, Edit3, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

// Pre-defined student rosters for quick classroom selection
const DEFAULT_STUDENT_ROSTERS = {
  'Lớp 9A1 (Mẫu 24 HS)': [
    'Hồ Thị Uyên', 'Văn An', 'Quốc Hùng', 'Thị Linh', 'Thị Nhung', 'Thị Thanh',
    'Văn Sơn', 'Thị Quỳnh', 'Minh Hoàng', 'Văn Khải', 'Thị Dung', 'Văn Trường',
    'Thị Thu', 'Thị Hoa', 'Văn Minh', 'Thị Lan', 'Văn Hùng', 'Thị Hạnh',
    'Văn Nam', 'Thị Trang', 'Văn Tú', 'Thị Thảo', 'Văn Cường', 'Thị Vân'
  ],
  'Lớp 10A2 (15 HS)': [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Vũ Thị E',
    'Đặng Văn F', 'Bùi Thị G', 'Đỗ Minh H', 'Hồ Văn I', 'Nông Thị K',
    'Trịnh Văn L', 'Phan Thị M', 'Lương Văn N', 'Ngô Thị O', 'Dương Văn P'
  ],
  'Lớp 6A3 (10 HS)': [
    'An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hương', 'Khánh', 'Linh', 'Minh', 'Nam'
  ]
};

// Realistic Tortoise Color Palettes
const TURTLE_COLORS = [
  { shell: '#15803d', shellDark: '#166534', shellPattern: '#22c55e', skin: '#4ade80', skinDark: '#15803d' }, // Emerald Tortoise
  { shell: '#b45309', shellDark: '#78350f', shellPattern: '#f59e0b', skin: '#fbbf24', skinDark: '#d97706' }, // Golden Desert Tortoise
  { shell: '#047857', shellDark: '#064e3b', shellPattern: '#10b981', skin: '#34d399', skinDark: '#047857' }, // Jade Mountain Tortoise
  { shell: '#854d0e', shellDark: '#543107', shellPattern: '#ca8a04', skin: '#eab308', skinDark: '#a16207' }, // Olive Brown Tortoise
  { shell: '#0f766e', shellDark: '#115e59', shellPattern: '#14b8a6', skin: '#2dd4bf', skinDark: '#0d9488' }, // Ocean Shell Tortoise
  { shell: '#4d7c0f', shellDark: '#365314', shellPattern: '#84cc16', skin: '#a3e635', skinDark: '#65a30d' }, // Grass Green Tortoise
  { shell: '#7c2d12', shellDark: '#451a03', shellPattern: '#ea580c', skin: '#fb923c', skinDark: '#c2410c' }, // Terracotta Tortoise
  { shell: '#3f6212', shellDark: '#1a2e05', shellPattern: '#65a30d', skin: '#84cc16', skinDark: '#4d7c0f' }  // Forest Moss Tortoise
];

const TURTLE_ACCESSORIES = ['👑', '🎩', '🎉', '👓', '🎀', '🕶️', '🎓'];

export function TurtleRaceGame({ questions, teams, onAddPoints, onClose }) {
  // Student Roster State
  const [selectedRosterName, setSelectedRosterName] = useState('Lớp 9A1 (Mẫu 24 HS)');
  const [studentList, setStudentList] = useState(DEFAULT_STUDENT_ROSTERS['Lớp 9A1 (Mẫu 24 HS)']);
  const [editingRoster, setEditingRoster] = useState(false);
  const [customRosterText, setCustomRosterText] = useState(studentList.join('\n'));

  // Race Settings
  const [winnerCountToPick, setWinnerCountToPick] = useState(1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Racing State
  const [isRacing, setIsRacing] = useState(false);
  const [turtleData, setTurtleData] = useState([]);
  const [allRankings, setAllRankings] = useState([]);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Track References & Animation Loop State
  const trackRef = useRef(null);
  const turtleDOMRefs = useRef([]);
  const turtleStateRef = useRef([]);
  const localRankingsRef = useRef([]);
  const animRef = useRef(null);
  const raceStartTimeRef = useRef(null);

  // Initialize Turtle Objects along vertical start line
  const initTurtles = () => {
    const names = studentList;
    const count = names.length;

    const topPadPercent = 8;
    const bottomPadPercent = 8;
    const availHeightPercent = 100 - topPadPercent - bottomPadPercent;
    const yStep = count > 1 ? availHeightPercent / (count - 1) : availHeightPercent / 2;

    const newTurtles = names.map((name, idx) => {
      const colorScheme = TURTLE_COLORS[idx % TURTLE_COLORS.length];
      const accessory = TURTLE_ACCESSORIES[idx % TURTLE_ACCESSORIES.length];
      const initialYPercent = topPadPercent + idx * yStep;

      return {
        id: `turtle_${idx}`,
        name,
        color: colorScheme,
        accessory,
        xPercent: 14,
        yPercent: initialYPercent,
        baseYPercent: initialYPercent,
        speedProfile: 0.82 + Math.random() * 0.35,
        freq: 1.1 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        finished: false,
        rank: null
      };
    });

    turtleStateRef.current = newTurtles;
    localRankingsRef.current = [];
    setTurtleData(newTurtles);
    setAllRankings([]);
    setIsRacing(false);
    setShowWinnerPopup(false);
  };

  useEffect(() => {
    initTurtles();
  }, [studentList]);

  // SILKY-SMOOTH 60-120FPS GPU TRANSLATE3D & 4-LEG CRAWLING MOTION ENGINE
  useEffect(() => {
    if (!isRacing) return;

    raceStartTimeRef.current = performance.now();
    localRankingsRef.current = [];

    const trackWidthPx = trackRef.current?.offsetWidth || 1000;
    const startXPx = trackWidthPx * 0.14;
    const finishXPx = trackWidthPx * 0.82; // 82% Finish line
    const distancePx = finishXPx - startXPx;

    const step = (now) => {
      const elapsedSec = (now - raceStartTimeRef.current) / 1000;
      const targetDurationSec = 17; // Realistic slow & steady tortoise race duration

      let allFinished = true;

      turtleStateRef.current.forEach((turtle, idx) => {
        if (turtle.finished) return;

        allFinished = false;

        const progress = Math.min(1, elapsedSec / targetDurationSec);

        // Continuous velocity curves (zero jitter noise)
        const wave1 = Math.sin(elapsedSec * turtle.freq + turtle.phase) * 16;
        const wave2 = Math.cos(elapsedSec * 0.5 + turtle.phase * 1.6) * 20;

        let currentXPx = startXPx + progress * distancePx * turtle.speedProfile + wave1 + wave2;
        currentXPx = Math.max(startXPx, Math.min(finishXPx, currentXPx));

        // Smooth subtle tortoise shell bobbing (±1.8px)
        const currentYOffsetPx = Math.sin(elapsedSec * 8 + turtle.phase) * 1.8;

        // Realistic 4-leg crawling rotation swing (±22 degrees diagonal gait)
        const legAngleFrontRight = Math.sin(elapsedSec * 16 + turtle.phase) * 22;
        const legAngleFrontLeft = -legAngleFrontRight;

        // Directly update DOM Translate3D for 100% 60/120 FPS hardware acceleration
        const domEl = turtleDOMRefs.current[idx];
        if (domEl) {
          domEl.style.transform = `translate3d(${currentXPx}px, ${currentYOffsetPx}px, 0)`;

          // Animate 4 legs crawling in real-time
          const flLeg = domEl.querySelector('.leg-fl');
          const frLeg = domEl.querySelector('.leg-fr');
          const rlLeg = domEl.querySelector('.leg-rl');
          const rrLeg = domEl.querySelector('.leg-rr');

          if (flLeg) flLeg.style.transform = `rotate(${legAngleFrontLeft}deg)`;
          if (frLeg) frLeg.style.transform = `rotate(${legAngleFrontRight}deg)`;
          if (rlLeg) rlLeg.style.transform = `rotate(${legAngleFrontRight}deg)`;
          if (rrLeg) rrLeg.style.transform = `rotate(${legAngleFrontLeft}deg)`;
        }

        // Check if turtle crossed finish line (82%)
        if (currentXPx >= finishXPx && !turtle.finished) {
          const nextRank = localRankingsRef.current.length + 1;
          turtle.finished = true;
          turtle.rank = nextRank;

          const finishRecord = {
            rank: nextRank,
            name: turtle.name,
            accessory: turtle.accessory,
            color: turtle.color
          };
          localRankingsRef.current.push(finishRecord);

          // Direct DOM update for rank badge
          const badgeEl = domEl?.querySelector('.rank-badge-text');
          if (badgeEl) {
            badgeEl.textContent = `${turtle.name} (#${nextRank})`;
            badgeEl.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
            badgeEl.style.border = '1.5px solid #facc15';
          }

          // Trigger winner popup when designated winner count is reached
          if (localRankingsRef.current.length === winnerCountToPick) {
            setAllRankings([...localRankingsRef.current]);
            setShowWinnerPopup(true);
            try {
              if (!soundMuted) SoundFX.fanfare();
              confetti({ particleCount: 180, spread: 110, origin: { y: 0.5 } });
            } catch (e) {}
          }
        }
      });

      // Continue animation loop smoothly until ALL turtles cross finish line
      if (!allFinished && elapsedSec < targetDurationSec + 3) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setIsRacing(false);
        setAllRankings([...localRankingsRef.current]);
        setTurtleData([...turtleStateRef.current]);
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRacing, winnerCountToPick]);

  // Start Race Handler
  const handleStartRace = () => {
    if (isRacing) return;
    initTurtles();
    setIsRacing(true);
    try {
      if (!soundMuted) SoundFX.correct();
    } catch (e) {}
  };

  // Save Custom Roster
  const handleSaveCustomRoster = () => {
    const lines = customRosterText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (lines.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên học sinh.');
      return;
    }
    setStudentList(lines);
    setSelectedRosterName('Tùy chỉnh (' + lines.length + ' HS)');
    setEditingRoster(false);
  };

  const primaryWinner = allRankings[0];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #15803d 0%, #047857 50%, #78350f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* CENTERED EARTHEN LAND RACE ARENA BOARD */}
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        height: '92vh',
        background: 'linear-gradient(180deg, #78350f 0%, #92400e 50%, #451a03 100%)',
        borderRadius: '24px',
        border: '10px solid #543107',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* TOP HEADER CONTROLS */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30
        }}>
          {/* Back Button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          {/* Roster & Winner Config Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedRosterName}
              onChange={(e) => {
                const name = e.target.value;
                setSelectedRosterName(name);
                const list = DEFAULT_STUDENT_ROSTERS[name] || [];
                setStudentList(list);
                setCustomRosterText(list.join('\n'));
              }}
              disabled={isRacing}
              style={{
                padding: '5px 12px',
                borderRadius: '14px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}
            >
              {Object.keys(DEFAULT_STUDENT_ROSTERS).map(rName => (
                <option key={rName} value={rName}>{rName}</option>
              ))}
            </select>

            <button
              onClick={() => setEditingRoster(true)}
              disabled={isRacing}
              style={{
                padding: '5px 10px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Edit3 size={14} /> Sửa HS ({studentList.length})
            </button>
          </div>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowSettingsModal(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)'
              }}
            >
              <Settings size={14} /> Chọn {winnerCountToPick} HS
            </button>

            <button
              onClick={() => setShowLeaderboardModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.88)',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              🏆 Xếp hạng 📊
            </button>

            <button
              onClick={() => setSoundMuted(!soundMuted)}
              style={{
                background: 'rgba(255, 255, 255, 0.88)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0f172a'
              }}
            >
              {soundMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#16a34a" />}
            </button>

            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  if (document.exitFullscreen) document.exitFullscreen();
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.88)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0f172a'
              }}
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>

        {/* TOP LAWN MARGIN WITH ROCKS & FLOWERS */}
        <div style={{
          height: '24px',
          background: 'linear-gradient(180deg, #15803d 0%, #166534 70%, #78350f 100%)',
          borderBottom: '2px solid #facc15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          fontSize: '0.75rem',
          zIndex: 10
        }}>
          {['🌸', '🪨', '🌸', '🍃', '🌸', '🪨', '🌸', '🍃', '🌸', '🪨', '🌸', '🍃', '🌸'].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>

        {/* DIRT LAND RACE TRACK ARENA */}
        <div
          ref={trackRef}
          style={{
            flex: 1,
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 16px, transparent 16px, transparent 32px)'
          }}
        >

          {/* CHECKERED FINISH LINE 🏁 POSITIONED AT 82% */}
          <div style={{
            position: 'absolute',
            left: '82%',
            top: 0,
            bottom: 0,
            width: '16px',
            background: 'repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 10px, #000000 10px, #000000 20px)',
            boxShadow: '0 0 14px rgba(255,255,255,0.7)',
            zIndex: 5
          }} />

          {/* REALISTIC 4-LEG CRAWLING TORTOISES */}
          {turtleData.map((turtle, idx) => (
            <div
              key={turtle.id}
              ref={el => turtleDOMRefs.current[idx] = el}
              style={{
                position: 'absolute',
                left: 0,
                top: `${turtle.yPercent}%`,
                transform: 'translate3d(0px, 0px, 0)',
                willChange: 'transform',
                zIndex: Math.round(turtle.yPercent * 10),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none'
              }}
            >
              {/* REALISTIC 2D ANATOMICAL TORTOISE SVG WITH 4 CRAWLING LEGS */}
              <div style={{ position: 'relative', width: '60px', height: '45px' }}>
                <svg viewBox="0 0 120 90" width="60" height="45" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>
                  {/* Ground Dirt Shadow */}
                  <ellipse cx="55" cy="78" rx="42" ry="8" fill="rgba(0,0,0,0.3)" />

                  {/* REAR LEFT LEG */}
                  <g className="leg-rl" style={{ transformOrigin: '28px 62px' }}>
                    <path d="M 24 60 Q 18 70 22 76 Q 28 78 32 72 Q 30 63 28 60 Z" fill={turtle.color.skinDark} />
                    <line x1="20" y1="76" x2="18" y2="80" stroke="#000" strokeWidth="1.2" />
                    <line x1="23" y1="78" x2="22" y2="82" stroke="#000" strokeWidth="1.2" />
                  </g>

                  {/* REAR RIGHT LEG */}
                  <g className="leg-rr" style={{ transformOrigin: '40px 62px' }}>
                    <path d="M 36 60 Q 32 70 36 76 Q 42 78 44 72 Q 42 63 40 60 Z" fill={turtle.color.skin} />
                    <line x1="34" y1="76" x2="32" y2="80" stroke="#000" strokeWidth="1.2" />
                    <line x1="37" y1="78" x2="36" y2="82" stroke="#000" strokeWidth="1.2" />
                  </g>

                  {/* TAIL */}
                  <path d="M 16 55 Q 6 58 2 54 Q 10 50 18 50 Z" fill={turtle.color.skin} />

                  {/* REALISTIC TORTOISE DOME SHELL */}
                  <path d="M 18 56 Q 52 14 86 56 Z" fill={turtle.color.shellDark} />
                  <path d="M 20 54 Q 52 16 84 54 Z" fill={turtle.color.shell} />
                  {/* Hexagon Scute Pattern */}
                  <path d="M 35 45 L 48 30 L 62 30 L 70 45 L 60 55 L 42 55 Z" fill={turtle.color.shellPattern} stroke={turtle.color.shellDark} strokeWidth="1.8" />
                  <path d="M 35 45 L 22 52 M 48 30 L 40 22 M 62 30 L 70 22 M 70 45 L 82 50" stroke={turtle.color.shellDark} strokeWidth="1.8" />

                  {/* FRONT LEFT LEG */}
                  <g className="leg-fl" style={{ transformOrigin: '64px 62px' }}>
                    <path d="M 60 60 Q 55 70 60 76 Q 66 78 70 72 Q 68 63 65 60 Z" fill={turtle.color.skinDark} />
                    <line x1="58" y1="76" x2="56" y2="80" stroke="#000" strokeWidth="1.2" />
                    <line x1="61" y1="78" x2="60" y2="82" stroke="#000" strokeWidth="1.2" />
                  </g>

                  {/* FRONT RIGHT LEG */}
                  <g className="leg-fr" style={{ transformOrigin: '76px 62px' }}>
                    <path d="M 72 60 Q 70 72 76 78 Q 84 79 86 72 Q 82 63 78 60 Z" fill={turtle.color.skin} />
                    <line x1="74" y1="78" x2="72" y2="82" stroke="#000" strokeWidth="1.2" />
                    <line x1="78" y1="79" x2="78" y2="83" stroke="#000" strokeWidth="1.2" />
                  </g>

                  {/* TORTOISE HEAD & NECK */}
                  <path d="M 76 46 Q 88 38 96 40 Q 106 44 102 54 Q 88 58 76 54 Z" fill={turtle.color.skin} />
                  {/* Nostril & Mouth */}
                  <circle cx="98" cy="44" r="1.2" fill="#000" />
                  <path d="M 94 50 Q 98 52 100 49" stroke="#064e3b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  {/* Eye */}
                  <circle cx="92" cy="42" r="3.5" fill="#0f172a" />
                  <circle cx="93.5" cy="41" r="1.2" fill="#ffffff" />
                </svg>

                {/* Accessory Hat on Tortoise Head */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '78%',
                  transform: 'translateX(-50%)',
                  fontSize: '1.15rem',
                  zIndex: 2
                }}>
                  {turtle.accessory}
                </div>
              </div>

              {/* Student Name Label Underneath Tortoise */}
              <div
                className="rank-badge-text"
                style={{
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.02em',
                  marginTop: '2px',
                  padding: '2px 6px',
                  borderRadius: '8px'
                }}
              >
                {turtle.name} {turtle.rank && `(#${turtle.rank})`}
              </div>
            </div>
          ))}

          {/* RIGHT FLOATING SQUARE GREEN "Đua!" BUTTON */}
          {!isRacing && (
            <button
              onClick={handleStartRace}
              style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '68px',
                height: '72px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: '#ffffff',
                border: '2px solid #4ade80',
                boxShadow: '0 10px 25px rgba(21, 128, 61, 0.5), 0 4px 12px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
                zIndex: 35
              }}
            >
              <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🐢</span>
              <span>Đua!</span>
            </button>
          )}

        </div>

        {/* BOTTOM LAWN MARGIN WITH ROCKS & FLOWERS */}
        <div style={{
          height: '24px',
          background: 'linear-gradient(0deg, #15803d 0%, #166534 70%, #78350f 100%)',
          borderTop: '2px solid #facc15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          fontSize: '0.75rem',
          zIndex: 10
        }}>
          {['🌸', '🪨', '🌸', '🍃', '🌸', '🪨', '🌸', '🍃', '🌸', '🪨', '🌸', '🍃', '🌸'].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>

      </div>

      {/* EDIT ROSTER MODAL */}
      {editingRoster && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.82)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '2px solid #4ade80',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4ade80', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} /> Nhập / Thêm Danh Sách Học Sinh
              </h3>
              <button onClick={() => setEditingRoster(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>
              Nhập tên mỗi học sinh trên một dòng (Ví dụ: Hồ Thị Uyên, Văn An...):
            </p>

            <textarea
              rows={10}
              value={customRosterText}
              onChange={(e) => setCustomRosterText(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: '#0f172a',
                border: '1px solid #475569',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                lineHeight: 1.5
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingRoster(false)}
                style={{ padding: '10px 20px', borderRadius: '12px', background: 'transparent', border: '1px solid #64748b', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCustomRoster}
                style={{ padding: '10px 24px', borderRadius: '12px', background: '#16a34a', border: 'none', color: '#fff', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={18} /> Lưu Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER SETTINGS MODAL */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.82)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '2px solid #16a34a',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4ade80', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} /> Cài Đặt Số Lượng HS May Mắn
            </h3>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                🎯 Số lượng con rùa bò về đích cần gọi tên:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    onClick={() => setWinnerCountToPick(num)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: winnerCountToPick === num ? '#16a34a' : '#0f172a',
                      color: '#fff',
                      border: winnerCountToPick === num ? '2px solid #4ade80' : '1px solid #334155',
                      fontWeight: 900,
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    {num} HS
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              style={{ padding: '12px', background: '#16a34a', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', marginTop: '8px' }}
            >
              Hoàn Tất Cài Đặt
            </button>
          </div>
        </div>
      )}

      {/* COMPLETE STUDENT LEADERBOARD MODAL */}
      {showLeaderboardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.82)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '2px solid #facc15',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '82vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={22} color="#facc15" /> Bảng Xếp Hạng Tất Cả Học Sinh ({allRankings.length}/{studentList.length})
              </h3>
              <button onClick={() => setShowLeaderboardModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {allRankings.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                Chưa có cuộc đua nào diễn ra. Bấm nút <strong>🐢 Đua!</strong> để bắt đầu cuộc đua gọi tên!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allRankings.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      borderRadius: '14px',
                      background: i === 0 
                        ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)' 
                        : (i === 1 ? 'rgba(203, 213, 225, 0.15)' : (i === 2 ? 'rgba(217, 119, 6, 0.15)' : 'rgba(255, 255, 255, 0.04)')),
                      border: i === 0 
                        ? '2px solid #facc15' 
                        : (i === 1 ? '1.5px solid #cbd5e1' : (i === 2 ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)'))
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', minWidth: '36px', color: i === 0 ? '#facc15' : (i === 1 ? '#cbd5e1' : (i === 2 ? '#f59e0b' : '#94a3b8')) }}>
                        {i === 0 ? '🥇 1' : (i === 1 ? '🥈 2' : (i === 2 ? '🥉 3' : `#${i + 1}`))}
                      </span>
                      <span style={{ fontSize: '1.25rem' }}>{w.accessory} 🐢</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>{w.name}</span>
                    </div>

                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: i === 0 ? '#facc15' : '#4ade80' }}>
                      {i === 0 ? '🏆 VỀ NHẤT' : `Hạng ${w.rank}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLeaderboardModal(false)}
              style={{ padding: '12px', background: '#16a34a', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', marginTop: '8px' }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATION WINNER SPOTLIGHT POPUP */}
      {showWinnerPopup && primaryWinner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '36px 40px',
            width: '100%',
            maxWidth: '460px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Party Popper Emoji */}
            <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>
              🎉
            </div>

            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b', margin: 0 }}>
              Chúc mừng
            </span>

            {/* Large Bold Green Winner Student Name */}
            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: '#16a34a',
              margin: '4px 0 12px 0',
              lineHeight: 1.2
            }}>
              {primaryWinner.name}
            </h1>

            {/* Green Rounded Primary Button */}
            <button
              onClick={() => setShowWinnerPopup(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)'
              }}
            >
              Đóng
            </button>

            {/* View Full Ranking Button */}
            <button
              onClick={() => {
                setShowWinnerPopup(false);
                setShowLeaderboardModal(true);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              🏆 Xem Bảng Xếp Hạng Tất Cả Học Sinh ({allRankings.length} HS)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
