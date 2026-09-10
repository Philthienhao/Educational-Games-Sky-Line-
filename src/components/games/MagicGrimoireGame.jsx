import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, RefreshCw, X, Award, Users, Volume2, VolumeX, Settings, Edit3, Check, BookOpen, Camera, CameraOff, Hand } from 'lucide-react';
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

export function MagicGrimoireGame({ questions, teams, game, activeTeamIndex = 0, onClose, currentUser }) {
  const [selectedRosterName, setSelectedRosterName] = useState('Lớp Chủ Nhiệm');
  const [rawStudentNames, setRawStudentNames] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [customRosterText, setCustomRosterText] = useState('');

  // AI Camera Gesture Detection State
  const [cameraActive, setCameraActive] = useState(false);
  const [motionScore, setMotionScore] = useState(0);
  const [cameraError, setCameraError] = useState(null);

  // Ancient Spellbook State
  const [grimoireState, setGrimoireState] = useState('idle'); // 'idle' | 'flipping' | 'revealed' | 'finished'
  const [summonedStudent, setSummonedStudent] = useState(null);
  const [flippingName, setFlippingName] = useState('');
  const [soundMuted, setSoundMuted] = useState(false);

  // References for AI Motion Sensing
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const prevFrameRef = useRef(null);
  const animFrameRef = useRef(null);

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

  // 2. Initialize Camera & AI Motion Sensing Loop
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError('Không thể mở Camera. Thầy cô bấm nút "Triệu Hồi" bên dưới để chơi trực tiếp.');
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

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 3. Motion Detection Loop using Canvas Pixel Diffing
  useEffect(() => {
    if (!cameraActive) return;

    const processMotion = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 80, 60);
        const currentData = ctx.getImageData(0, 0, 80, 60).data;

        if (prevFrameRef.current) {
          let diffSum = 0;
          const prevData = prevFrameRef.current;

          for (let i = 0; i < currentData.length; i += 4) {
            const diffR = Math.abs(currentData[i] - prevData[i]);
            const diffG = Math.abs(currentData[i + 1] - prevData[i + 1]);
            const diffB = Math.abs(currentData[i + 2] - prevData[i + 2]);
            diffSum += (diffR + diffG + diffB) / 3;
          }

          const avgDiff = diffSum / (80 * 60);
          const normalizedScore = Math.min(100, Math.round(avgDiff * 3.5));
          setMotionScore(normalizedScore);

          // Trigger Summon if hand motion passes 45% threshold during IDLE state!
          if (normalizedScore > 45 && grimoireState === 'idle') {
            handleSummonGrimoire();
          }
        }

        prevFrameRef.current = currentData;
      }

      animFrameRef.current = requestAnimationFrame(processMotion);
    };

    animFrameRef.current = requestAnimationFrame(processMotion);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, grimoireState, rawStudentNames]);

  // 4. Ancient Grimoire Summoning Sequence
  const handleSummonGrimoire = () => {
    if (grimoireState !== 'idle' || !rawStudentNames || rawStudentNames.length === 0) return;

    if (!soundMuted) try { SoundFX.click(); } catch(e) {}

    // Pick random student winner
    const randomIndex = Math.floor(Math.random() * rawStudentNames.length);
    const selectedName = rawStudentNames[randomIndex];
    const studentName = (typeof selectedName === 'object' && selectedName !== null) ? (selectedName.name || selectedName.question || selectedName.text || 'Học sinh') : String(selectedName || 'Học sinh');

    setSummonedStudent(studentName);
    setGrimoireState('flipping');

    // Rapid page flipping animation
    let count = 0;
    const interval = setInterval(() => {
      const randIndex = Math.floor(Math.random() * rawStudentNames.length);
      const randStr = rawStudentNames[randIndex];
      const nameStr = (typeof randStr === 'object' && randStr !== null) ? (randStr.name || randStr.question || randStr.text || 'Học sinh') : String(randStr || 'Học sinh');
      setFlippingName(nameStr);
      count++;

      if (!soundMuted) try { SoundFX.spinTick(); } catch(e) {}

      if (count >= 18) {
        clearInterval(interval);
        setGrimoireState('revealed');

        setTimeout(() => {
          setGrimoireState('finished');
          if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
          try { confetti({ particleCount: 150, spread: 90 }); } catch(e) {}
        }, 1000);
      }
    }, 90);
  };

  const handleResetGrimoire = () => {
    setGrimoireState('idle');
    setSummonedStudent(null);
    setFlippingName('');
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
    handleResetGrimoire();
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '680px',
      background: 'radial-gradient(circle at center, #78350f 0%, #0f172a 100%)',
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
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📜 Cổ Thư Triệu Hồi — AI Nhận Diện Cử Chỉ Tay
            </h2>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fde047', border: '1px solid #f59e0b', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem' }}>
              {selectedRosterName} ({rawStudentNames.length} Học Sinh)
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
            Vẫy tay trước Camera AI hoặc bấm nút để tự động lật Cổ Thư Ma Thuật chọn học sinh!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleCamera}
            className="btn btn-secondary btn-sm"
            style={{
              borderRadius: '12px',
              padding: '8px 14px',
              background: cameraActive ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              border: cameraActive ? '1px solid #22c55e' : '1px solid #ef4444',
              color: cameraActive ? '#86efac' : '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title={cameraActive ? 'Nhấp để Tắt Camera AI Vẫy Tay' : 'Nhấp để Mở Camera AI Vẫy Tay'}
          >
            {cameraActive ? <Camera size={16} /> : <CameraOff size={16} />}
            {cameraActive ? 'Bật Camera AI' : 'Mở Camera AI'}
          </button>

          <button
            onClick={() => setShowRosterModal(true)}
            disabled={grimoireState !== 'idle'}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', padding: '8px 14px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fde047' }}
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

      {/* ANCIENT SPELLBOOK MAGIC LIBRARY STAGE */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '880px',
        height: '480px',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(120, 53, 15, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '5px solid #f59e0b',
        borderRadius: '28px',
        boxShadow: '0 0 45px rgba(245, 158, 11, 0.35), inset 0 0 60px rgba(0,0,0,0.85)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>

        {/* CAMERA ERROR NOTIFICATION ALERT */}
        {cameraError && !cameraActive && (
          <div style={{
            position: 'absolute',
            top: '20px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}>
            <span>⚠️ {cameraError}</span>
            <button
              onClick={startCamera}
              className="btn btn-sm"
              style={{ background: '#ffffff', color: '#ef4444', fontWeight: 900, borderRadius: '8px', padding: '4px 10px', border: 'none', cursor: 'pointer' }}
            >
              Cấp Quyền & Mở Cam
            </button>
          </div>
        )}

        {/* OPEN ANCIENT GRIMOIRE SPELLBOOK */}
        <div style={{
          position: 'relative',
          width: '560px',
          height: '330px',
          background: 'linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%)',
          borderRadius: '16px',
          border: '12px solid #78350f',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          zIndex: 10,
          overflow: 'hidden'
        }}>
          {/* Left & Right Pages Partition Line */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px', background: 'linear-gradient(180deg, #d97706 0%, #78350f 100%)', zIndex: 5 }} />

          {/* Left Page: Camera AI Magic Viewport & Spellbook Title */}
          <div style={{
            flex: 1,
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #fde047',
            background: 'rgba(255, 251, 230, 0.65)'
          }}>
            {/* Embedded Camera AI Magic Frame */}
            <div
              onClick={toggleCamera}
              style={{
                position: 'relative',
                width: '180px',
                height: '120px',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#0f172a',
                border: cameraActive ? '3px solid #d97706' : '3px solid #ef4444',
                boxShadow: cameraActive ? '0 0 16px rgba(217, 119, 6, 0.45)' : '0 0 12px rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title={cameraActive ? "Nhấp để Tắt Camera AI Vẫy Tay" : "Nhấp vào đây để Mở Camera AI Vẫy Tay"}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirrored view
                  display: cameraActive ? 'block' : 'none'
                }}
                muted
                playsInline
              />
              <canvas ref={canvasRef} width={80} height={60} style={{ display: 'none' }} />

              {!cameraActive && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#fca5a5',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <CameraOff size={28} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>NHẤP ĐỂ MỞ CAM</span>
                </div>
              )}

              {cameraActive && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(4px)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Hand size={10} /> AI LIVE
                </div>
              )}
            </div>

            {/* Motion Detection Score Meter */}
            {cameraActive ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '180px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.65rem', fontWeight: 800, color: '#78350f' }}>
                  <span>Vẫy tay nhận diện:</span>
                  <span style={{ color: motionScore > 45 ? '#d97706' : '#2563eb' }}>{motionScore}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(120, 53, 15, 0.15)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(120, 53, 15, 0.3)' }}>
                  <div style={{
                    height: '100%',
                    width: `${motionScore}%`,
                    background: motionScore > 45 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #38bdf8, #3b82f6)',
                    transition: 'width 0.1s linear'
                  }} />
                </div>
              </div>
            ) : null}

            <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.04em' }}>
              📜 CỔ THƯ MA THUẬT
            </span>
            <span style={{ fontSize: '0.68rem', color: '#b45309', marginTop: '2px', textAlign: 'center', fontWeight: 700 }}>
              {cameraActive ? '👋 Vẫy tay trước Camera để quay' : '💡 Nhấp vào ô trên để mở Camera AI'}
            </span>
          </div>

          {/* Right Page Dynamic Flipping Name */}
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            {grimoireState === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>🔮</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#78350f' }}>SẴN SÀNG TRIỆU HỒI</span>
              </div>
            )}

            {grimoireState === 'flipping' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', animation: 'pulse 0.1s infinite' }}>
                  {flippingName}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 800 }}>ĐANG LẬT CỔ THƯ...</span>
              </div>
            )}

            {(grimoireState === 'revealed' || grimoireState === 'finished') && summonedStudent && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', animation: 'popIn 0.3s ease-out' }}>
                <span style={{ fontSize: '2.2rem' }}>✨</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#78350f', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {summonedStudent}
                </h3>
                <span className="badge" style={{ background: '#f59e0b', color: '#000', fontWeight: 900, padding: '4px 12px', borderRadius: '10px', fontSize: '0.72rem' }}>
                  ĐÃ ĐƯỢC TRIỆU HỒI
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10, marginTop: '12px' }}>
        <button
          onClick={handleSummonGrimoire}
          disabled={grimoireState !== 'idle' || rawStudentNames.length === 0}
          className="btn btn-primary"
          style={{
            padding: '16px 48px',
            borderRadius: '20px',
            fontSize: '1.25rem',
            fontWeight: 900,
            background: grimoireState !== 'idle' 
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: grimoireState !== 'idle' ? 'none' : '0 8px 24px rgba(245, 158, 11, 0.5)'
          }}
        >
          <BookOpen size={24} className={grimoireState !== 'idle' ? 'spin' : ''} />
          {grimoireState === 'idle' ? '📜 BẤM LẬT CỔ THƯ MA THUẬT' : '📜 CỔ THƯ ĐANG LẬT TRANG...'}
        </button>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
          👋 Bạn có thể vẫy tay trước Camera AI để tự động kích hoạt Cổ Thư Ma Thuật!
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
                <Users size={22} color="#f59e0b" />
                Cấu Hình Danh Sách Học Sinh Cổ Thư
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
                  border: '1px solid rgba(245, 158, 11, 0.4)',
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
                style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={18} /> Lưu Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER POPUP MODAL */}
      {grimoireState === 'finished' && summonedStudent && (
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
            border: '3px solid #f59e0b',
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ fontSize: '5.5rem', animation: 'bounce 1s infinite' }}>
              📜
            </div>

            <span className="badge" style={{ background: '#f59e0b', color: '#000000', fontWeight: 900, padding: '6px 18px', fontSize: '1rem', borderRadius: '12px' }}>
              🎉 CHÚC MỪNG HỌC SINH ĐƯỢC TRIỆU HỒI!
            </span>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {summonedStudent}
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.98rem', margin: 0 }}>
              Cổ Thư Ma Thuật đã lật trang triệu hồi thành công học sinh {summonedStudent}!
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
              <button
                onClick={handleResetGrimoire}
                className="btn btn-primary"
                style={{ padding: '12px 28px', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                📜 Triệu Hồi Tiếp
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
