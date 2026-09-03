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

// Duck Color & Accessory Palettes Matching Sample Video
const DUCK_COLORS = [
  { body: '#facc15', wing: '#eab308', beak: '#f97316' }, // Yellow
  { body: '#ef4444', wing: '#dc2626', beak: '#f97316' }, // Red
  { body: '#38bdf8', wing: '#0284c7', beak: '#f97316' }, // Cyan
  { body: '#f472b6', wing: '#ec4899', beak: '#f97316' }, // Pink
  { body: '#c084fc', wing: '#9333ea', beak: '#f97316' }, // Purple
  { body: '#fb923c', wing: '#ea580c', beak: '#ea580c' }, // Orange
  { body: '#a16207', wing: '#854d0e', beak: '#ea580c' }, // Brown
  { body: '#f8fafc', wing: '#cbd5e1', beak: '#f97316' }, // White
  { body: '#4ade80', wing: '#16a34a', beak: '#f97316' }  // Green
];

const DUCK_ACCESSORIES = ['👑', '🎩', '🎉', '👓', '🎀', '🕶️', '🎓'];

export function DuckRaceGame({ questions, teams, onAddPoints, onClose }) {
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
  const [duckData, setDuckData] = useState([]);
  const [allRankings, setAllRankings] = useState([]); // Array of ALL students ranked in finish order
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // River Track References
  const riverRef = useRef(null);
  const duckDOMRefs = useRef([]);
  const duckStateRef = useRef([]);
  const localRankingsRef = useRef([]);
  const animRef = useRef(null);
  const raceStartTimeRef = useRef(null);

  // Initialize Duck Objects along vertical start line
  const initDucks = () => {
    const names = studentList;
    const count = names.length;

    const topPadPercent = 8;
    const bottomPadPercent = 8;
    const availHeightPercent = 100 - topPadPercent - bottomPadPercent;
    const yStep = count > 1 ? availHeightPercent / (count - 1) : availHeightPercent / 2;

    const newDucks = names.map((name, idx) => {
      const colorScheme = DUCK_COLORS[idx % DUCK_COLORS.length];
      const accessory = DUCK_ACCESSORIES[idx % DUCK_ACCESSORIES.length];
      const initialYPercent = topPadPercent + idx * yStep;

      return {
        id: `duck_${idx}`,
        name,
        color: colorScheme,
        accessory,
        xPercent: 14, // Start Line X %
        yPercent: initialYPercent,
        baseYPercent: initialYPercent,
        // Deterministic smooth continuous velocity parameters (Zero random noise jitter)
        speedProfile: 0.85 + Math.random() * 0.30,
        freq: 1.2 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        finished: false,
        rank: null
      };
    });

    duckStateRef.current = newDucks;
    localRankingsRef.current = [];
    setDuckData(newDucks);
    setAllRankings([]);
    setIsRacing(false);
    setShowWinnerPopup(false);
  };

  useEffect(() => {
    initDucks();
  }, [studentList]);

  // SILKY-SMOOTH 60-120FPS GPU HARDWARE-ACCELERATED TRANSLATE3D MOTION LOOP
  useEffect(() => {
    if (!isRacing) return;

    raceStartTimeRef.current = performance.now();
    localRankingsRef.current = [];

    // Measure exact pixel dimensions of river arena
    const riverWidthPx = riverRef.current?.offsetWidth || 1000;
    const startXPx = riverWidthPx * 0.14;
    const finishXPx = riverWidthPx * 0.82; // 82% Finish line far right
    const distancePx = finishXPx - startXPx;

    const step = (now) => {
      const elapsedSec = (now - raceStartTimeRef.current) / 1000;
      const targetDurationSec = 15; // Smooth 15-second long race

      let allDucksFinished = true;

      duckStateRef.current.forEach((duck, idx) => {
        if (duck.finished) return;

        allDucksFinished = false;

        // Smooth continuous time progress (0 to 1)
        const progress = Math.min(1, elapsedSec / targetDurationSec);

        // Continuous deterministic velocity curves (ZERO random frame noise)
        const wave1 = Math.sin(elapsedSec * duck.freq + duck.phase) * 20; // Smooth ±20px wave
        const wave2 = Math.cos(elapsedSec * 0.6 + duck.phase * 1.8) * 25; // Smooth ±25px wave

        let currentXPx = startXPx + progress * distancePx * duck.speedProfile + wave1 + wave2;
        currentXPx = Math.max(startXPx, Math.min(finishXPx, currentXPx));

        // Smooth gentle waddling Y offset (±2.5px)
        const currentYOffsetPx = Math.sin(elapsedSec * 6 + duck.phase) * 2.5;

        // Directly update DOM Translate3D for 100% hardware-accelerated 60/120 FPS
        const domEl = duckDOMRefs.current[idx];
        if (domEl) {
          domEl.style.transform = `translate3d(${currentXPx}px, ${currentYOffsetPx}px, 0)`;
        }

        // Check if duck crossed finish line (82%)
        if (currentXPx >= finishXPx && !duck.finished) {
          const nextRank = localRankingsRef.current.length + 1;
          duck.finished = true;
          duck.rank = nextRank;

          const finishRecord = {
            rank: nextRank,
            name: duck.name,
            accessory: duck.accessory,
            color: duck.color
          };
          localRankingsRef.current.push(finishRecord);

          // Direct DOM update for rank badge without triggering React re-render
          const badgeEl = domEl?.querySelector('.rank-badge-text');
          if (badgeEl) {
            badgeEl.textContent = `${duck.name} (#${nextRank})`;
            badgeEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
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

      // Continue animation loop smoothly until ALL 24 ducks cross finish line
      if (!allDucksFinished && elapsedSec < targetDurationSec + 3) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setIsRacing(false);
        setAllRankings([...localRankingsRef.current]);
        setDuckData([...duckStateRef.current]);
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
    initDucks();
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
      background: 'linear-gradient(135deg, #2dd4bf 0%, #a855f7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* CENTERED GAME BOARD MATCHING SAMPLE VIDEO 100% */}
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        height: '92vh',
        background: 'linear-gradient(180deg, #1d70b8 0%, #1e40af 100%)',
        borderRadius: '24px',
        border: '10px solid #78350f',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
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
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
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
              {soundMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#0284c7" />}
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

        {/* TOP RIVERBANK GRASS & FLOWERS */}
        <div style={{
          height: '24px',
          background: 'linear-gradient(180deg, #15803d 0%, #16a34a 70%, #854d0e 100%)',
          borderBottom: '2px solid #facc15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          fontSize: '0.75rem',
          zIndex: 10
        }}>
          {['🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸'].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>

        {/* RIVER WATER ARENA WITH HORIZONTAL WAVE LINES */}
        <div
          ref={riverRef}
          style={{
            flex: 1,
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 12px, transparent 12px, transparent 24px)'
          }}
        >

          {/* CHECKERED FINISH LINE 🏁 POSITIONED AT 82% (LONGER EXCITING TRACK TOWARDS END) */}
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

          {/* DUCKS SWIMMING WITH 60-120FPS GPU HARDWARE-ACCELERATED TRANSLATE3D */}
          {duckData.map((duck, idx) => (
            <div
              key={duck.id}
              ref={el => duckDOMRefs.current[idx] = el}
              style={{
                position: 'absolute',
                left: 0,
                top: `${duck.yPercent}%`,
                transform: 'translate3d(0px, 0px, 0)',
                willChange: 'transform',
                zIndex: Math.round(duck.yPercent * 10),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none'
              }}
            >
              {/* Duck SVG Graphics + Oval Water Reflection Shadow */}
              <div style={{ position: 'relative', width: '44px', height: '44px' }}>
                <svg viewBox="0 0 100 100" width="44" height="44" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}>
                  {/* Oval Water Shadow */}
                  <ellipse cx="50" cy="85" rx="35" ry="10" fill="rgba(0,0,0,0.2)" />
                  {/* Tail */}
                  <path d="M 15 50 Q 5 40 10 30 Q 25 35 30 50 Z" fill={duck.color.wing} />
                  {/* Body */}
                  <ellipse cx="45" cy="62" rx="34" ry="22" fill={duck.color.body} />
                  {/* Wing */}
                  <path d="M 30 58 Q 50 42 60 62 Q 40 72 30 58 Z" fill={duck.color.wing} />
                  {/* Head */}
                  <circle cx="70" cy="36" r="18" fill={duck.color.body} />
                  {/* Eye */}
                  <circle cx="76" cy="32" r="3.5" fill="#0f172a" />
                  <circle cx="77.5" cy="31" r="1.2" fill="#ffffff" />
                  {/* Beak */}
                  <path d="M 85 36 L 98 40 L 85 44 Z" fill={duck.color.beak} />
                </svg>

                {/* Accessory Hat */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '60%',
                  transform: 'translateX(-50%)',
                  fontSize: '1.1rem',
                  zIndex: 2
                }}>
                  {duck.accessory}
                </div>
              </div>

              {/* Student Name Label Underneath Duck */}
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
                {duck.name} {duck.rank && `(#${duck.rank})`}
              </div>
            </div>
          ))}

          {/* RIGHT FLOATING SQUARE PURPLE "Đua!" BUTTON */}
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
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: '2px solid #c084fc',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.5), 0 4px 12px rgba(0,0,0,0.3)',
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
              <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🦆</span>
              <span>Đua!</span>
            </button>
          )}

        </div>

        {/* BOTTOM RIVERBANK GRASS & FLOWERS */}
        <div style={{
          height: '24px',
          background: 'linear-gradient(0deg, #15803d 0%, #16a34a 70%, #854d0e 100%)',
          borderTop: '2px solid #facc15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          fontSize: '0.75rem',
          zIndex: 10
        }}>
          {['🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸', '⭐', '🌸'].map((item, i) => (
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
            border: '2px solid #38bdf8',
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                style={{ padding: '10px 24px', borderRadius: '12px', background: '#0284c7', border: 'none', color: '#fff', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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
            border: '2px solid #0284c7',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} /> Cài Đặt Số Lượng HS May Mắn
            </h3>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                🎯 Số lượng con vịt về đích cần gọi tên:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    onClick={() => setWinnerCountToPick(num)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: winnerCountToPick === num ? '#0284c7' : '#0f172a',
                      color: '#fff',
                      border: winnerCountToPick === num ? '2px solid #38bdf8' : '1px solid #334155',
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
              style={{ padding: '12px', background: '#0284c7', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', marginTop: '8px' }}
            >
              Hoàn Tất Cài Đặt
            </button>
          </div>
        </div>
      )}

      {/* COMPLETE STUDENT LEADERBOARD MODAL (ALL STUDENTS RANKED FROM 1ST TO LAST) */}
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
                Chưa có cuộc đua nào diễn ra. Bấm nút <strong>🦆 Đua!</strong> để bắt đầu cuộc đua gọi tên!
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
                      <span style={{ fontSize: '1.25rem' }}>{w.accessory} 🦆</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>{w.name}</span>
                    </div>

                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: i === 0 ? '#facc15' : '#38bdf8' }}>
                      {i === 0 ? '🏆 VỀ NHẤT' : `Hạng ${w.rank}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLeaderboardModal(false)}
              style={{ padding: '12px', background: '#0284c7', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', marginTop: '8px' }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATION WINNER SPOTLIGHT POPUP MATCHING SAMPLE VIDEO */}
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

            {/* Large Bold Royal Blue Winner Student Name */}
            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: '#2563eb',
              margin: '4px 0 12px 0',
              lineHeight: 1.2
            }}>
              {primaryWinner.name}
            </h1>

            {/* Blue Rounded Primary Button Matching Sample Video */}
            <button
              onClick={() => setShowWinnerPopup(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)'
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
