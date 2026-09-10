import React, { useState, useEffect } from 'react';
import { Play, Sparkles, RefreshCw, X, Award, Users, Volume2, VolumeX, Settings, Edit3, Check, Wand2, Gift } from 'lucide-react';
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

const MAGIC_CHARACTERS = [
  { icon: '🐰', title: 'Chú Thỏ Ma Thuật' },
  { icon: '🐲', title: 'Rồng Con Huyền Bí' },
  { icon: '🧙‍♂️', title: 'Phù Thủy Tập Sự' },
  { icon: '🐱', title: 'Mèo Thần Kỳ' },
  { icon: '🦊', title: 'Hồ Ly Ma Thuật' }
];

export function MagicHatGame({ questions, teams, game, activeTeamIndex = 0, onClose, currentUser }) {
  const [selectedRosterName, setSelectedRosterName] = useState('Lớp Chủ Nhiệm');
  const [rawStudentNames, setRawStudentNames] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [customRosterText, setCustomRosterText] = useState('');

  // Magic Stage Animation State
  const [magicState, setMagicState] = useState('idle'); // 'idle' | 'wiggling' | 'summoning' | 'finished'
  const [summonedStudent, setSummonedStudent] = useState(null);
  const [magicCharacter, setMagicCharacter] = useState(MAGIC_CHARACTERS[0]);
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

  // 2. Summoning Magic Sequence Controller
  const handleSummonMagic = () => {
    if (magicState !== 'idle' || !rawStudentNames || rawStudentNames.length === 0) return;

    if (!soundMuted) try { SoundFX.click(); } catch(e) {}

    // Pick random student name
    const randomIndex = Math.floor(Math.random() * rawStudentNames.length);
    const selectedName = rawStudentNames[randomIndex];
    const studentName = (typeof selectedName === 'object' && selectedName !== null) ? (selectedName.name || selectedName.question || selectedName.text || 'Học sinh') : String(selectedName || 'Học sinh');
    
    setSummonedStudent(studentName);
    setMagicCharacter(MAGIC_CHARACTERS[Math.floor(Math.random() * MAGIC_CHARACTERS.length)]);

    // STEP 1: Magic Hat starts wiggling & glowing (1.2s)
    setMagicState('wiggling');
    if (!soundMuted) {
      try { SoundFX.spinTick(); } catch(e) {}
      try { SoundFX.timerTick(); } catch(e) {}
    }

    setTimeout(() => {
      // STEP 2: Magic Rabbit / Character pops out of hat (1.0s)
      setMagicState('summoning');
      if (!soundMuted) try { SoundFX.correct(); } catch(e) {}

      setTimeout(() => {
        // STEP 3: Victory Winner Modal Popup!
        setMagicState('finished');
        if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
        try { confetti({ particleCount: 150, spread: 90 }); } catch(e) {}
      }, 1000);

    }, 1200);
  };

  const handleResetMagic = () => {
    setMagicState('idle');
    setSummonedStudent(null);
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
    handleResetMagic();
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '680px',
      background: 'radial-gradient(circle at center, #831843 0%, #0f172a 100%)',
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
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#f472b6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎩 Chiếc Mũ Ma Thuật — Hộp Quà Bí Mật
            </h2>
            <span className="badge" style={{ background: 'rgba(244, 114, 182, 0.25)', color: '#fbcfe8', border: '1px solid #ec4899', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem' }}>
              {selectedRosterName} ({rawStudentNames.length} Học Sinh)
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
            Bấm gậy ma thuật, chiếc mũ huyền bí sẽ phát sáng và thỏ con chui ra triệu hồi học sinh!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowRosterModal(true)}
            disabled={magicState !== 'idle'}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', padding: '8px 14px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #ec4899', color: '#fbcfe8' }}
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

      {/* MAGICIAN STAGE STAGE */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '880px',
        height: '480px',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(131, 24, 67, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '5px solid #ec4899',
        borderRadius: '28px',
        boxShadow: '0 0 45px rgba(236, 72, 153, 0.4), inset 0 0 60px rgba(0,0,0,0.85)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>

        {/* MAGIC SPARKLES SHIMMER BACKGROUND */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none', background: 'radial-gradient(circle, #f472b6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* MAGICIAN TOP HAT & POPPING CHARACTER */}
        <div 
          onClick={handleSummonMagic}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: magicState === 'idle' ? 'pointer' : 'default',
            zIndex: 10
          }}
        >
          {/* POPPING CHARACTER FROM HAT */}
          <div style={{
            fontSize: '6.5rem',
            transform: (magicState === 'summoning' || magicState === 'finished') 
              ? 'translateY(-20px) scale(1.1)' 
              : 'translateY(80px) scale(0.2)',
            opacity: (magicState === 'summoning' || magicState === 'finished') ? 1 : 0,
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'drop-shadow(0 0 25px #f472b6)',
            zIndex: 5
          }}>
            {magicCharacter.icon}
          </div>

          {/* MAGICIAN TOP HAT (🎩) */}
          <div style={{
            fontSize: '11rem',
            lineHeight: 0.8,
            animation: magicState === 'wiggling' ? 'shake 0.15s infinite' : 'none',
            filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.7))',
            zIndex: 12,
            transition: 'transform 0.3s ease'
          }}>
            🎩
          </div>

          {/* SUMMONED STUDENT NAME BADGE SCROLL */}
          {(magicState === 'summoning' || magicState === 'finished') && summonedStudent && (
            <div style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
              color: '#ffffff',
              padding: '12px 32px',
              borderRadius: '20px',
              fontSize: '1.8rem',
              fontWeight: 900,
              boxShadow: '0 0 35px #f472b6',
              zIndex: 20,
              animation: 'popIn 0.4s ease-out',
              border: '3px solid #fde047',
              textAlign: 'center'
            }}>
              ✨ {summonedStudent} ✨
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10, marginTop: '12px' }}>
        <button
          onClick={handleSummonMagic}
          disabled={magicState !== 'idle' || rawStudentNames.length === 0}
          className="btn btn-primary"
          style={{
            padding: '16px 48px',
            borderRadius: '20px',
            fontSize: '1.25rem',
            fontWeight: 900,
            background: magicState !== 'idle' 
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
              : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: magicState !== 'idle' ? 'none' : '0 8px 24px rgba(236, 72, 153, 0.5)'
          }}
        >
          <Wand2 size={24} className={magicState !== 'idle' ? 'spin' : ''} />
          {magicState === 'idle' ? '🪄 BẤM TRIỆU HỒI MA THUẬT' : '🪄 ĐANG VẪY GẬY MA THUẬT...'}
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
                <Users size={22} color="#ec4899" />
                Cấu Hình Danh Sách Học Sinh Mũ Ma Thuật
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
                  border: '1px solid rgba(236, 72, 153, 0.4)',
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
                style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={18} /> Lưu Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER POPUP MODAL */}
      {magicState === 'finished' && summonedStudent && (
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
            border: '3px solid #ec4899',
            boxShadow: '0 20px 60px rgba(236, 72, 153, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ fontSize: '5.5rem', animation: 'bounce 1s infinite' }}>
              {magicCharacter.icon}
            </div>

            <span className="badge" style={{ background: '#ec4899', color: '#ffffff', fontWeight: 900, padding: '6px 18px', fontSize: '1rem', borderRadius: '12px' }}>
              🎉 {magicCharacter.title} ĐÃ TRIỆU HỒI!
            </span>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {summonedStudent}
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.98rem', margin: 0 }}>
              Đã được chiếc mũ ma thuật chọn ngẫu nhiên lên bảng nhận thưởng!
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
              <button
                onClick={handleResetMagic}
                className="btn btn-primary"
                style={{ padding: '12px 28px', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
              >
                🪄 Triệu Hồi Tiếp
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
