import React, { useState, useEffect } from 'react';
import { Play, Sparkles, RefreshCw, X, Award, Users, Volume2, VolumeX, Settings, Edit3, Check, RotateCcw, Zap, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StorageService } from '../../services/storage';

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

const PLUSHIE_ICONS = ['🧸', '🐻', '🐰', '🐼', '🦁', '🐯', '🐶', '🐱', '🦊', '🐨', '🦄', '🐵', '🐸', '🐷', '🐮', '🐥'];
const PLUSHIE_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'];

export function ClawMachineGame({ questions, teams, game, activeTeamIndex = 0, onClose, currentUser }) {
  // Roster & Settings State
  const [selectedRosterName, setSelectedRosterName] = useState('Lớp Chủ Nhiệm');
  const [rawStudentNames, setRawStudentNames] = useState([]);
  const [plushieBin, setPlushieBin] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [customRosterText, setCustomRosterText] = useState('');

  // Mechanical Claw State
  const [clawState, setClawState] = useState('idle'); // 'idle' | 'moving' | 'lowering-decoy' | 'fakeout-switch' | 'moving' | 'lowering' | 'grabbing' | 'raising' | 'chute' | 'dropping' | 'finished'
  const [clawX, setClawX] = useState(50); // percentage 0-100 across carriage
  const [clawY, setClawY] = useState(0); // percentage 0-100 lowering depth
  const [isClawClosed, setIsClawClosed] = useState(false);
  const [targetPlushie, setTargetPlushie] = useState(null);
  const [showFakeOutBanner, setShowFakeOutBanner] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // 1. Initial Load of Student Roster
  useEffect(() => {
    let names = [];
    
    // Check custom questions array if passed
    if (Array.isArray(questions) && questions.length > 0) {
      names = questions.map(q => {
        if (!q) return null;
        if (typeof q === 'string') return q;
        return q.name || q.question || q.text || q.studentName;
      }).filter(Boolean);
      
      if (names.length > 0) {
        setSelectedRosterName(`Danh sách tải lên (${names.length} HS)`);
      }
    }
    
    // Fallback to Homeroom if no custom questions
    if (names.length === 0) {
      try {
        const hr = StorageService.getTeacherHomeroom(currentUser?.id);
        if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
          names = hr.students.map(s => (typeof s === 'object' && s !== null) ? (s.name || s.studentName || 'Học sinh') : String(s || ''));
          setSelectedRosterName(hr.className || 'Lớp Chủ Nhiệm');
        }
      } catch(e) {
        console.warn("Could not load homeroom for claw machine:", e);
      }
    }

    // Default sample if homeroom is empty
    if (names.length === 0) {
      names = DEFAULT_STUDENT_ROSTERS['Lớp 9A1 (Mẫu 24 HS)'];
      setSelectedRosterName('Lớp 9A1 (Mẫu 24 HS)');
    }

    setRawStudentNames(names);
    setCustomRosterText(names.join('\n'));
  }, [questions, currentUser]);

  // 2. Generate Deterministic Grid Layout for Plushies in Bin
  useEffect(() => {
    if (!rawStudentNames || rawStudentNames.length === 0) {
      setPlushieBin([]);
      return;
    }

    const count = rawStudentNames.length;
    const cols = count <= 8 ? 4 : count <= 15 ? 5 : count <= 24 ? 6 : 7;
    
    // X placement boundaries inside plushie bin (22% to 84%)
    const minX = 22;
    const maxX = 84;
    const xRange = maxX - minX;

    const plushies = rawStudentNames.map((nameStr, idx) => {
      const name = (typeof nameStr === 'object' && nameStr !== null) ? (nameStr.name || nameStr.question || nameStr.text || 'Học sinh') : String(nameStr || 'Học sinh');
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      // Exact target X percentage for claw carriage
      const xPercent = cols > 1 ? minX + col * (xRange / (cols - 1)) : 50;

      // Floor positioning (Row 0 is front row bottom=14px, Row 1 bottom=54px, Row 2 bottom=94px)
      const bottomPx = 14 + row * 40;

      // Lowering depth: Row 0 lowers deeper (68%), Row 1 (58%), Row 2 (48%)
      const targetDepthY = Math.max(42, 68 - row * 10);

      return {
        id: `plushie_${idx}`,
        name,
        icon: PLUSHIE_ICONS[idx % PLUSHIE_ICONS.length],
        color: PLUSHIE_COLORS[idx % PLUSHIE_COLORS.length],
        xPercent,
        bottomPx,
        targetDepthY
      };
    });

    setPlushieBin(plushies);
  }, [rawStudentNames]);

  // 3. Main Mechanical Claw Motion Sequence Controller with Low-Altitude Horizontal Fake-Out Sweep
  const handleStartGrab = () => {
    if (clawState !== 'idle' || !plushieBin || plushieBin.length === 0) return;

    if (!soundMuted) try { SoundFX.click(); } catch(e) {}

    // 1. Pick final winner plushie
    const winnerIdx = Math.floor(Math.random() * plushieBin.length);
    const finalWinner = plushieBin[winnerIdx];
    setTargetPlushie(finalWinner);

    // 2. Determine if this turn triggers a Surprise Fake-Out Switch (~45% chance)
    const isFakeOut = plushieBin.length > 1 && Math.random() < 0.45;

    if (isFakeOut) {
      // Pick a decoy plushie different from final winner
      const otherPlushies = plushieBin.filter(p => p.id !== finalWinner.id);
      const decoy = otherPlushies[Math.floor(Math.random() * otherPlushies.length)];

      // STEP 1: Move claw carriage horizontally to DECOY plushie (1.0s)
      setClawState('moving-decoy');
      setIsClawClosed(false);
      setShowFakeOutBanner(false);
      setClawX(decoy.xPercent);
      setClawY(0);

      setTimeout(() => {
        // STEP 2: Lower claw cable right down above DECOY plushie (0.8s)
        setClawState('lowering-decoy');
        if (!soundMuted) try { SoundFX.clawGrab(); } catch(e) {}
        setClawY(decoy.targetDepthY);

        setTimeout(() => {
          // STEP 3: SUDDEN LOW-ALTITUDE HORIZONTAL SWEEP TO WINNER! "BẤT NGỜ CHƯA?" (0.5s)
          // Tay kẹp KHÔNG thu lên lại mà quét ngang ở tầm thấp sang học sinh chiến thắng thực sự!
          setClawState('fakeout-switch');
          setShowFakeOutBanner(true);
          if (!soundMuted) {
            try { SoundFX.spinTick(); } catch(e) {}
            try { SoundFX.timerUrgentTick(1.6); } catch(e) {}
          }
          
          setClawX(finalWinner.xPercent);
          setClawY(finalWinner.targetDepthY);

          setTimeout(() => {
            setShowFakeOutBanner(false);

            // STEP 4: Close pincers around ACTUAL winner (0.4s)
            setClawState('grabbing');
            setIsClawClosed(true);

            setTimeout(() => {
              // STEP 5: Raise cable back to top carrying winner (1.0s)
              setClawState('raising');
              setClawY(0);

              setTimeout(() => {
                // STEP 6: Move carriage to Prize Chute (X = 10%) (1.0s)
                setClawState('chute');
                setClawX(10);

                setTimeout(() => {
                  // STEP 7: Drop into chute (0.5s)
                  setClawState('dropping');
                  setIsClawClosed(false);

                  setTimeout(() => {
                    // STEP 8: Victory Popup!
                    setClawState('finished');
                    if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
                    try { confetti({ particleCount: 140, spread: 90 }); } catch(e) {}
                  }, 500);

                }, 1000);

              }, 1000);

            }, 400);

          }, 500);

        }, 800);

      }, 1000);

    } else {
      // Normal Direct Grab Trajectory
      setClawState('moving');
      setIsClawClosed(false);
      setShowFakeOutBanner(false);
      setClawX(finalWinner.xPercent);
      setClawY(0);

      setTimeout(() => {
        setClawState('lowering');
        if (!soundMuted) try { SoundFX.clawGrab(); } catch(e) {}
        setClawY(finalWinner.targetDepthY);

        setTimeout(() => {
          setClawState('grabbing');
          setIsClawClosed(true);

          setTimeout(() => {
            setClawState('raising');
            setClawY(0);

            setTimeout(() => {
              setClawState('chute');
              setClawX(10);

              setTimeout(() => {
                setClawState('dropping');
                setIsClawClosed(false);

                setTimeout(() => {
                  setClawState('finished');
                  if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
                  try { confetti({ particleCount: 140, spread: 90 }); } catch(e) {}
                }, 500);

              }, 1000);

            }, 1000);

          }, 400);

        }, 1000);

      }, 1000);
    }
  };

  const handleResetGame = () => {
    setClawState('idle');
    setClawX(50);
    setClawY(0);
    setIsClawClosed(false);
    setTargetPlushie(null);
    setShowFakeOutBanner(false);
  };

  // Switch Roster Preset
  const handleSelectPresetRoster = (presetName) => {
    if (presetName === 'Lớp Chủ Nhiệm') {
      try {
        const hr = StorageService.getTeacherHomeroom(currentUser?.id);
        if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
          const names = hr.students.map(s => (typeof s === 'object' && s !== null) ? (s.name || s.studentName || 'Học sinh') : String(s || ''));
          setRawStudentNames(names);
          setCustomRosterText(names.join('\n'));
          setSelectedRosterName(hr.className || 'Lớp Chủ Nhiệm');
        } else {
          alert('Chưa có danh sách học sinh trong Lớp Chủ Nhiệm. Vui lòng thêm học sinh ở mục Lớp Chủ Nhiệm.');
        }
      } catch(e) {}
    } else if (DEFAULT_STUDENT_ROSTERS[presetName]) {
      const names = DEFAULT_STUDENT_ROSTERS[presetName];
      setRawStudentNames(names);
      setCustomRosterText(names.join('\n'));
      setSelectedRosterName(presetName);
    }
  };

  // Save Custom Edited Roster
  const handleSaveCustomRosterText = () => {
    const lines = customRosterText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (lines.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên học sinh.');
      return;
    }
    setRawStudentNames(lines);
    setSelectedRosterName(`Tùy chỉnh (${lines.length} HS)`);
    setShowRosterModal(false);
    handleResetGame();
  };

  // Dynamic CSS Transitions for Master Carriage Assembly & Cable Claw Head
  const clawXTransitionStyle = clawState === 'fakeout-switch'
    ? 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
    : (clawState === 'moving' || clawState === 'moving-decoy' || clawState === 'chute')
      ? 'left 1.0s ease-in-out'
      : 'none';

  const clawYTransitionStyle = clawState === 'fakeout-switch'
    ? 'height 0.45s ease-out'
    : (clawState === 'lowering' || clawState === 'lowering-decoy' || clawState === 'raising')
      ? 'height 0.8s ease-in-out'
      : 'none';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '680px',
      background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Montserrat, system-ui, sans-serif'
    }}>
      
      {/* Top Header Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1000px', zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧸 Máy Gắp Thú Gọi Tên Học Sinh
            </h2>
            <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', border: '1px solid #a855f7', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem' }}>
              {selectedRosterName} ({rawStudentNames.length} Học Sinh)
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
            Gắp ngẫu nhiên gấu bông chọn ra 1 học sinh may mắn lên bảng nhận thưởng!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowRosterModal(true)}
            disabled={clawState !== 'idle'}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', padding: '8px 14px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#c4b5fd' }}
          >
            <Settings size={16} /> Danh Sách Học Sinh
          </button>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', padding: '8px 14px' }}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {soundMuted ? 'Bật Âm' : 'Tắt Âm'}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5' }}
            >
              <X size={16} /> Đóng Game
            </button>
          )}
        </div>
      </div>

      {/* ARCADE CLAW MACHINE GLASS CABINET */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '880px',
        height: '480px',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: '6px solid #a855f7',
        borderRadius: '28px',
        boxShadow: '0 0 45px rgba(168, 85, 247, 0.45), inset 0 0 60px rgba(0,0,0,0.85)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* SURPRISE FAKE-OUT "BẤT NGỜ CHƯA?" BANNER */}
        {showFakeOutBanner && (
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            color: '#ffffff',
            padding: '10px 28px',
            borderRadius: '20px',
            fontWeight: 900,
            fontSize: '1.4rem',
            boxShadow: '0 0 35px #ec4899',
            zIndex: 40,
            animation: 'pulse 0.2s infinite alternate',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '3px solid #fde047'
          }}>
            <Sparkles size={26} color="#fde047" className="spin" />
            🎉 BẤT NGỜ CHƯA? 🎉
          </div>
        )}
        
        {/* Top Metallic Carriage Rail Track */}
        <div style={{
          height: '28px',
          background: 'linear-gradient(180deg, #64748b 0%, #334155 100%)',
          borderBottom: '2px solid #94a3b8',
          position: 'relative',
          zIndex: 5
        }}>
          {/* UNIFIED MASTER CARRIAGE & CLAW ASSEMBLY (LOCKED TOGETHER 100%) */}
          <div style={{
            position: 'absolute',
            left: `${clawX}%`,
            top: '0',
            transform: 'translateX(-50%)',
            transition: clawXTransitionStyle,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Motor Carriage Block */}
            <div style={{
              width: '48px',
              height: '24px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              border: '1.5px solid #fde047'
            }} />

            {/* Cable & Mechanical Claw Head (Extends vertically downward from center of Carriage) */}
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              height: `${clawY * 3.8}px`,
              width: '4px',
              background: 'linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)',
              transition: clawYTransitionStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Mechanical Pincer Claw Head */}
              <div style={{
                position: 'absolute',
                bottom: '-28px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Claw Hinge Hub */}
                <div style={{ width: '22px', height: '14px', background: '#e2e8f0', borderRadius: '4px', border: '1.5px solid #334155' }} />
                
                {/* Left & Right Mechanical Pincers */}
                <div style={{ display: 'flex', gap: isClawClosed ? '4px' : '20px', transition: 'gap 0.3s ease' }}>
                  <div style={{
                    width: '13px',
                    height: '26px',
                    borderLeft: '4px solid #facc15',
                    borderBottom: '4px solid #facc15',
                    borderRadius: '0 0 0 10px',
                    transform: isClawClosed ? 'rotate(18deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} />
                  <div style={{
                    width: '13px',
                    height: '26px',
                    borderRight: '4px solid #facc15',
                    borderBottom: '4px solid #facc15',
                    borderRadius: '0 0 10px 0',
                    transform: isClawClosed ? 'rotate(-18deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} />
                </div>

                {/* Grabbed Plushie attached inside claw head */}
                {isClawClosed && targetPlushie && (clawState === 'grabbing' || clawState === 'raising' || clawState === 'chute' || clawState === 'dropping') && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'bounce 0.5s infinite'
                  }}>
                    <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' }}>
                      {targetPlushie.icon}
                    </div>
                    <span style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: `1px solid ${targetPlushie.color}`,
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}>
                      {targetPlushie.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prize Drop Chute (Left Side) */}
        <div style={{
          position: 'absolute',
          left: '12px',
          bottom: '0',
          width: '110px',
          height: '120px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.45) 100%)',
          border: '3px solid #f59e0b',
          borderRadius: '18px 18px 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fde047',
          fontWeight: 900,
          fontSize: '0.85rem',
          zIndex: 4,
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)'
        }}>
          <span style={{ fontSize: '1.4rem' }}>🎁</span>
          <span>CỬA NHẬN QUÀ</span>
        </div>

        {/* Plushie Bin Floor with Student Plushies */}
        <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}>
          {plushieBin.map(st => {
            const isGrabbedThis = targetPlushie?.id === st.id && (clawState === 'grabbing' || clawState === 'raising' || clawState === 'chute' || clawState === 'dropping');
            if (isGrabbedThis) return null; // Hide from floor while held in claw pincers

            return (
              <div
                key={st.id}
                style={{
                  position: 'absolute',
                  left: `${st.xPercent}%`,
                  bottom: `${st.bottomPx}px`,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all 0.3s ease',
                  zIndex: 3
                }}
              >
                <div style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
                  {st.icon}
                </div>
                <span style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  border: `1.5px solid ${st.color}`,
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }}>
                  {st.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10, marginTop: '10px' }}>
        <button
          onClick={handleStartGrab}
          disabled={clawState !== 'idle' || plushieBin.length === 0}
          className="btn btn-primary"
          style={{
            padding: '16px 48px',
            borderRadius: '20px',
            fontSize: '1.25rem',
            fontWeight: 900,
            background: clawState !== 'idle' 
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
              : 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: clawState !== 'idle' ? 'none' : '0 8px 24px rgba(168, 85, 247, 0.5)'
          }}
        >
          <Sparkles size={24} className={clawState !== 'idle' ? 'spin' : ''} />
          {clawState === 'idle' ? '🤖 BẤM GẮP THÚ NGẪU NHIÊN' : '🤖 TAY GẮP ĐANG DI CHUYỂN...'}
        </button>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
          🎉 Máy gắp có xác suất quét ngang ở tầm thấp bất ngờ chuyển hướng kịch tính tạo tiếng cười cho học sinh!
        </span>
      </div>

      {/* ROSTER CONFIGURATION SETTINGS MODAL */}
      {showRosterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '560px', padding: '28px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} color="#a855f7" />
                Cấu Hình Danh Sách Học Sinh Gắp Thú
              </h3>
              <button onClick={() => setShowRosterModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Preset Selection Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Chọn danh sách mẫu có sẵn:
              </label>
              <select
                onChange={(e) => handleSelectPresetRoster(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <option value="Lớp Chủ Nhiệm">Lớp Chủ Nhiệm (Tự động từ hệ thống)</option>
                {Object.keys(DEFAULT_STUDENT_ROSTERS).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Custom Student Names Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Hoặc sửa/dán danh sách học sinh (mỗi tên 1 dòng):
              </label>
              <textarea
                value={customRosterText}
                onChange={(e) => setCustomRosterText(e.target.value)}
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder="Nhập tên học sinh, mỗi dòng 1 tên..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowRosterModal(false)}
                className="btn btn-secondary"
                style={{ padding: '10px 20px', borderRadius: '12px' }}
              >
                Hủy
              </button>

              <button
                onClick={handleSaveCustomRosterText}
                className="btn btn-primary"
                style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={18} /> Lưu Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER POPUP MODAL */}
      {clawState === 'finished' && targetPlushie && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal animate-popIn" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '36px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '3px solid #facc15',
            boxShadow: '0 20px 60px rgba(250, 204, 21, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ fontSize: '5.5rem', animation: 'bounce 1s infinite' }}>
              {targetPlushie.icon}
            </div>

            <span className="badge" style={{ background: '#f59e0b', color: '#000000', fontWeight: 900, padding: '6px 18px', fontSize: '1rem', borderRadius: '12px' }}>
              🎉 CHÚC MỪNG HỌC SINH MAY MẮN!
            </span>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {targetPlushie.name}
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.98rem', margin: 0 }}>
              Đã được máy gắp thú bông chọn ngẫu nhiên lên bảng nhận thưởng!
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
              <button
                onClick={handleResetGame}
                className="btn btn-primary"
                style={{ padding: '12px 28px', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
              >
                🤖 Gắp Lần Nữa
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '0.95rem' }}
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
