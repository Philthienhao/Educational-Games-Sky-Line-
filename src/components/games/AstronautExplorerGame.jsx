import React, { useState, useEffect } from 'react';
import { Play, Sparkles, RefreshCw, X, Award, Users, Volume2, VolumeX, Settings, Edit3, Check, Rocket, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StorageService } from '../../services/storage';

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

const PLANET_ICONS = ['🪐', '🌍', '🌕', '🛸', '⭐', '☄️', '🌟', '🌌'];
const PLANET_COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb923c', '#4ade80', '#facc15', '#22d3ee'];

export function AstronautExplorerGame({ questions, teams, game, activeTeamIndex = 0, onClose, currentUser }) {
  const [selectedRosterName, setSelectedRosterName] = useState('Lớp Chủ Nhiệm');
  const [rawStudentNames, setRawStudentNames] = useState([]);
  const [studentPlanets, setStudentPlanets] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [customRosterText, setCustomRosterText] = useState('');

  // Space Mission Animation State
  const [explorerState, setExplorerState] = useState('idle'); // 'idle' | 'countdown' | 'launching' | 'finished'
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [rocketPos, setRocketPos] = useState({ x: 50, y: 86, scale: 1, rotate: -45, launchAngle: 0 });
  const [winnerStudent, setWinnerStudent] = useState(null);
  const [soundMuted, setSoundMuted] = useState(false);

  // 1. Initial Load of Student Roster
  useEffect(() => {
    let names = [];
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
    
    if (names.length === 0) {
      try {
        const hr = StorageService.getTeacherHomeroom(currentUser?.id);
        if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
          names = hr.students.map(s => (typeof s === 'object' && s !== null) ? (s.name || s.studentName || 'Học sinh') : String(s || ''));
          setSelectedRosterName(hr.className || 'Lớp Chủ Nhiệm');
        }
      } catch(e) {}
    }

    if (names.length === 0) {
      names = DEFAULT_STUDENT_ROSTERS['Lớp 9A1 (Mẫu 24 HS)'];
      setSelectedRosterName('Lớp 9A1 (Mẫu 24 HS)');
    }

    setRawStudentNames(names);
    setCustomRosterText(names.join('\n'));
  }, [questions, currentUser]);

  // 2. Generate Planetary Orbit Coordinates for Students
  useEffect(() => {
    if (!rawStudentNames || rawStudentNames.length === 0) {
      setStudentPlanets([]);
      return;
    }

    const count = rawStudentNames.length;
    const cols = count <= 7 ? count : count <= 14 ? Math.ceil(count / 2) : count <= 24 ? Math.ceil(count / 3) : 8;
    const rows = Math.ceil(count / cols);

    const planets = rawStudentNames.map((nameStr, idx) => {
      const name = (typeof nameStr === 'object' && nameStr !== null) ? (nameStr.name || nameStr.question || nameStr.text || 'Học sinh') : String(nameStr || 'Học sinh');
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      // Grid positioning across upper sky view (15% to 85% X, 14% to 46% Y)
      const xPercent = cols > 1 ? 15 + col * (70 / (cols - 1)) : 50;
      const minTopY = 14;
      const maxTopY = 46;
      const yPercent = rows > 1 ? minTopY + row * ((maxTopY - minTopY) / (rows - 1)) : 20;

      return {
        id: `planet_${idx}`,
        name,
        icon: PLANET_ICONS[idx % PLANET_ICONS.length],
        color: PLANET_COLORS[idx % PLANET_COLORS.length],
        xPercent,
        yPercent
      };
    });

    setStudentPlanets(planets);
  }, [rawStudentNames]);

  // 3. 3-Second Countdown & Diagonal Rocket Space Launch Sequence
  const handleStartMission = () => {
    if (explorerState !== 'idle' || !studentPlanets || studentPlanets.length === 0) return;

    // Pick random winner student planet
    const winnerIdx = Math.floor(Math.random() * studentPlanets.length);
    const winner = studentPlanets[winnerIdx];
    setWinnerStudent(winner);

    // Calculate launch angle from central ground pad (50%, 86%) to target (winner.xPercent, winner.yPercent)
    // Container aspect ratio (920 / 480 = 1.917)
    const dx = (winner.xPercent - 50) * 1.917;
    const dy = winner.yPercent - 86; // negative since yPercent is higher up (smaller number)
    const angleRad = Math.atan2(dx, -dy); // 0deg = straight UP, >0 = RIGHT, <0 = LEFT
    const angleDeg = (angleRad * 180) / Math.PI;

    // Rocket emoji points up-right at 45deg by default, so subtract 45deg to align nozzle tip
    const rocketRotation = angleDeg - 45;

    // ALWAYS keep rocket at center ground launchpad (x = 50%, y = 86%) during countdown, rotated towards target
    setRocketPos({
      x: 50,
      y: 86,
      scale: 1,
      rotate: rocketRotation,
      launchAngle: angleDeg
    });
    setExplorerState('countdown');
    setCountdownSeconds(3);

    let currCount = 3;
    if (!soundMuted) try { SoundFX.timerTick(); } catch(e) {}

    const countdownInterval = setInterval(() => {
      currCount--;
      setCountdownSeconds(currCount);
      if (!soundMuted && currCount > 0) {
        try { SoundFX.timerUrgentTick(1 + (3 - currCount) * 0.3); } catch(e) {}
      }

      if (currCount <= 0) {
        clearInterval(countdownInterval);
        
        // LAUNCH ROCKET DIAGONALLY TOWARDS TARGET PLANET FROM CENTER PAD!
        setExplorerState('launching');
        if (!soundMuted) try { SoundFX.clawGrab(); } catch(e) {}

        // Move diagonally from center (50%, 86%) to target planet (winner.xPercent, winner.yPercent)
        setRocketPos({
          x: winner.xPercent,
          y: winner.yPercent,
          scale: 1.35,
          rotate: rocketRotation,
          launchAngle: angleDeg
        });

        setTimeout(() => {
          setExplorerState('finished');
          if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
          try { confetti({ particleCount: 150, spread: 100 }); } catch(e) {}
        }, 1300);
      }
    }, 900);
  };

  const handleResetMission = () => {
    setExplorerState('idle');
    setCountdownSeconds(3);
    setRocketPos({ x: 50, y: 86, scale: 1, rotate: -45, launchAngle: 0 });
    setWinnerStudent(null);
  };

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
          alert('Chưa có danh sách học sinh trong Lớp Chủ Nhiệm.');
        }
      } catch(e) {}
    } else if (DEFAULT_STUDENT_ROSTERS[presetName]) {
      const names = DEFAULT_STUDENT_ROSTERS[presetName];
      setRawStudentNames(names);
      setCustomRosterText(names.join('\n'));
      setSelectedRosterName(presetName);
    }
  };

  const handleSaveCustomRosterText = () => {
    const lines = customRosterText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (lines.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên học sinh.');
      return;
    }
    setRawStudentNames(lines);
    setSelectedRosterName(`Tùy chỉnh (${lines.length} HS)`);
    setShowRosterModal(false);
    handleResetMission();
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '680px',
      background: 'radial-gradient(circle at center, #1e1b4b 0%, #090d16 100%)',
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
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧑‍🚀 Phi Hành Gia — Thám Hiểm Vũ Trụ
            </h2>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.25)', color: '#7dd3fc', border: '1px solid #0284c7', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem' }}>
              {selectedRosterName} ({rawStudentNames.length} Học Sinh)
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
            Đếm ngược 3s kịch tính, tên lửa tại trạm trung tâm phóng chéo ngẫu nhiên lên trúng tên học sinh phía trên!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowRosterModal(true)}
            disabled={explorerState !== 'idle'}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', padding: '8px 14px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #0284c7', color: '#7dd3fc' }}
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

      {/* SPACE EXPLORER GALAXY ARENA */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '920px',
        height: '480px',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(30, 41, 59, 0.8) 0%, rgba(9, 13, 22, 0.95) 100%)',
        border: '4px solid #38bdf8',
        borderRadius: '28px',
        boxShadow: '0 0 45px rgba(56, 189, 248, 0.35), inset 0 0 60px rgba(0,0,0,0.85)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* 3-SECOND COUNTDOWN OVERLAY BANNER */}
        {explorerState === 'countdown' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#facc15', letterSpacing: '0.05em' }}>
              🚀 CHUẨN BỊ PHÓNG TÊN LỬA VŨ TRỤ!
            </span>
            <div style={{
              fontSize: '6.5rem',
              fontWeight: 900,
              color: '#38bdf8',
              textShadow: '0 0 40px #38bdf8',
              animation: 'pulse 0.3s infinite alternate'
            }}>
              {countdownSeconds}
            </div>
          </div>
        )}

        {/* GROUND LAUNCH BASE (MẶT ĐẤT TRẠM PHÓNG) */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '44px',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderTop: '3px solid #38bdf8',
          boxShadow: '0 -4px 20px rgba(56, 189, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#38bdf8',
          fontWeight: 900,
          fontSize: '0.82rem',
          letterSpacing: '0.05em',
          zIndex: 8
        }}>
          <span>🌐 MẶT ĐẤT — TRẠM PHÓNG TÊN LỬA VŨ TRỤ</span>
        </div>

        {/* DIAGONAL ROCKET EXHAUST SMOKE TRAIL */}
        {explorerState === 'launching' && (
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '14%',
            width: '14px',
            height: `${Math.sqrt(Math.pow((rocketPos.x - 50) * 1.917, 2) + Math.pow(86 - rocketPos.y, 2)) * 4.4}px`,
            background: 'linear-gradient(0deg, rgba(251, 146, 60, 0.95) 0%, rgba(239, 68, 68, 0.8) 50%, rgba(56, 189, 248, 0) 100%)',
            borderRadius: '8px',
            boxShadow: '0 0 20px #fb923c, 0 0 35px #ef4444',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${rocketPos.launchAngle || 0}deg)`,
            zIndex: 18,
            transition: 'height 1.3s cubic-bezier(0.15, 0.85, 0.35, 1.1)'
          }} />
        )}

        {/* FLYING SPACE ROCKET ANIMATION (STAYS AT CENTER & LAUNCHES DIAGONALLY) */}
        <div style={{
          position: 'absolute',
          left: `${rocketPos.x}%`,
          top: `${rocketPos.y}%`,
          transform: `translate(-50%, -50%) scale(${rocketPos.scale}) rotate(${rocketPos.rotate}deg)`,
          transition: explorerState === 'launching' 
            ? 'left 1.3s cubic-bezier(0.15, 0.85, 0.35, 1.1), top 1.3s cubic-bezier(0.15, 0.85, 0.35, 1.1)' 
            : 'none',
          zIndex: 20,
          fontSize: '3.2rem',
          filter: 'drop-shadow(0 0 18px #38bdf8)'
        }}>
          🚀
        </div>

        {/* ORBITING STUDENT PLANET NODES */}
        <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}>
          {studentPlanets.map(st => {
            const isSelectedTarget = winnerStudent?.id === st.id && explorerState === 'finished';

            return (
              <div
                key={st.id}
                style={{
                  position: 'absolute',
                  left: `${st.xPercent}%`,
                  top: `${st.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 5
                }}
              >
                <div style={{
                  fontSize: isSelectedTarget ? '3.2rem' : '2.4rem',
                  filter: `drop-shadow(0 0 12px ${st.color})`,
                  transition: 'transform 0.4s ease',
                  animation: isSelectedTarget ? 'pulse 0.4s infinite alternate' : 'none'
                }}>
                  {st.icon}
                </div>
                <span style={{
                  background: 'rgba(9, 13, 22, 0.9)',
                  border: `1.5px solid ${st.color}`,
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 0 12px ${st.color}50`
                }}>
                  {st.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10, marginTop: '12px' }}>
        <button
          onClick={handleStartMission}
          disabled={explorerState !== 'idle' || studentPlanets.length === 0}
          className="btn btn-primary"
          style={{
            padding: '16px 48px',
            borderRadius: '20px',
            fontSize: '1.25rem',
            fontWeight: 900,
            background: explorerState !== 'idle' 
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
              : 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: explorerState !== 'idle' ? 'none' : '0 8px 24px rgba(2, 132, 199, 0.5)'
          }}
        >
          <Rocket size={24} className={explorerState !== 'idle' ? 'spin' : ''} />
          {explorerState === 'idle' ? '🧑‍🚀 BẤM KHỞI HÀNH PHÓNG TÊN LỬA' : '🧑‍🚀 ĐANG ĐẾM NGƯỢC & PHÓNG TÊN LỬA...'}
        </button>
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
                <Users size={22} color="#38bdf8" />
                Cấu Hình Danh Sách Học Sinh Phi Hành Gia
              </h3>
              <button onClick={() => setShowRosterModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

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
                  border: '1px solid rgba(56, 189, 248, 0.4)',
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
                style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={18} /> Lưu Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER POPUP MODAL */}
      {explorerState === 'finished' && winnerStudent && (
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
            border: '3px solid #38bdf8',
            boxShadow: '0 20px 60px rgba(56, 189, 248, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ fontSize: '5.5rem', animation: 'bounce 1s infinite' }}>
              🧑‍🚀
            </div>

            <span className="badge" style={{ background: '#38bdf8', color: '#000000', fontWeight: 900, padding: '6px 18px', fontSize: '1rem', borderRadius: '12px' }}>
              🎉 CHÚC MỪNG PHI HÀNH GIA MAY MẮN!
            </span>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {winnerStudent.name}
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.98rem', margin: 0 }}>
              Tên lửa vũ trụ đã hạ cánh thành công xuống hành tinh {winnerStudent.name}!
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
              <button
                onClick={handleResetMission}
                className="btn btn-primary"
                style={{ padding: '12px 28px', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)' }}
              >
                🚀 Phóng Tên Lửa Tiếp
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
