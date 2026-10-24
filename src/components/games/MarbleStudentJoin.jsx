import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, CheckCircle2, UserPlus, Sparkles, 
  ArrowRight, ShieldCheck, Flame, RefreshCw, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MarbleLobbyService } from '../../services/marbleLobbyService';

// Bảng màu bi 3D sống động
const MARBLE_PALETTE = [
  { id: 'red', name: 'Đỏ Lửa', color: '#ef4444', gradient: 'radial-gradient(circle at 35% 35%, #fca5a5, #ef4444 60%, #991b1b 100%)' },
  { id: 'blue', name: 'Lam Ngọc', color: '#3b82f6', gradient: 'radial-gradient(circle at 35% 35%, #93c5fd, #3b82f6 60%, #1e40af 100%)' },
  { id: 'green', name: 'Lục Bảo', color: '#10b981', gradient: 'radial-gradient(circle at 35% 35%, #a7f3d0, #10b981 60%, #065f46 100%)' },
  { id: 'amber', name: 'Vàng Kim', color: '#f59e0b', gradient: 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 60%, #92400e 100%)' },
  { id: 'purple', name: 'Tím Neon', color: '#8b5cf6', gradient: 'radial-gradient(circle at 35% 35%, #ddd6fe, #8b5cf6 60%, #5b21b6 100%)' },
  { id: 'pink', name: 'Hồng Phấn', color: '#ec4899', gradient: 'radial-gradient(circle at 35% 35%, #fbcfe8, #ec4899 60%, #9d174d 100%)' },
  { id: 'cyan', name: 'Xanh Biển', color: '#06b6d4', gradient: 'radial-gradient(circle at 35% 35%, #a5f3fc, #06b6d4 60%, #155e75 100%)' },
  { id: 'orange', name: 'Cam Rực', color: '#f97316', gradient: 'radial-gradient(circle at 35% 35%, #fed7aa, #f97316 60%, #9a3412 100%)' },
  { id: 'silver', name: 'Bạch Kim', color: '#94a3b8', gradient: 'radial-gradient(circle at 35% 35%, #f1f5f9, #94a3b8 60%, #334155 100%)' }
];

export function MarbleStudentJoin({ pin }) {
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [selectedColor, setSelectedColor] = useState(MARBLE_PALETTE[Math.floor(Math.random() * MARBLE_PALETTE.length)]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [currentQueueNumber, setCurrentQueueNumber] = useState(1);

  // Audio Synth for feedback
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  };

  // Load Lobby details
  useEffect(() => {
    let isMounted = true;
    const fetchLobby = async () => {
      if (!pin) {
        if (isMounted) {
          setErrorMsg('Không tìm thấy mã PIN phòng đua! Vui lòng quét lại mã QR.');
          setLoading(false);
        }
        return;
      }
      try {
        const data = await MarbleLobbyService.getLobby(pin);
        if (isMounted) {
          if (data) {
            setLobby(data);
            if (data.teacherSchool && !studentSchool) {
              setStudentSchool(data.teacherSchool);
            }
          }
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLobby();
    return () => { isMounted = false; };
  }, [pin]);

  // Compute initials for ball preview
  const initials = useMemo(() => {
    const raw = studentName.trim();
    if (!raw) return 'HS';
    const words = raw.split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }, [studentName]);

  // Dynamic Game Aesthetics & Information
  const gameInfo = useMemo(() => {
    const type = lobby?.gameType || 'marble-race';
    if (type === 'duck-race') {
      return {
        title: 'ĐUA VỊT GỌI TÊN',
        icon: '🦆',
        subtitle: 'Gia Nhập Đàn Vịt Về Đích',
        readyText: 'VỊT CỦA BẠN ĐÃ XUỐNG NƯỚC!',
        badgeText: 'Vịt số #',
        avatarEmoji: '🦆',
        colorLabel: 'Màu sắc chú vịt may mắn',
        promptAction: 'đưa chú vịt của bạn vào đàn bơi',
        screenPrompt: 'để theo dõi đàn vịt bơi nảy lửa trên sông và cổ vũ cho chú vịt của mình nhé!',
        bgGradient: 'radial-gradient(circle at 50% 0%, #0369a1 0%, #082f49 70%, #020617 100%)',
        accentColor: '#38bdf8'
      };
    }
    if (type === 'turtle-race') {
      return {
        title: 'ĐUA RÙA GỌI TÊN',
        icon: '🐢',
        subtitle: 'Gia Nhập Đội Rùa Về Đích',
        readyText: 'RÙA CỦA BẠN ĐÃ VÀO VẠCH XUẤT PHÁT!',
        badgeText: 'Rùa số #',
        avatarEmoji: '🐢',
        colorLabel: 'Màu mai rùa may mắn',
        promptAction: 'đưa chú rùa của bạn vào đường đua bò',
        screenPrompt: 'để theo dõi cuộc đua rùa kịch tính và cổ vũ cho chú rùa của mình về nhất nhé!',
        bgGradient: 'radial-gradient(circle at 50% 0%, #065f46 0%, #022c22 70%, #020617 100%)',
        accentColor: '#34d399'
      };
    }
    if (type === 'claw-machine') {
      return {
        title: 'GẮP THÚ GỌI TÊN',
        icon: '🧸',
        subtitle: 'Gia Nhập Tủ Gấu Bông May Mắn',
        readyText: 'GẤU BÔNG CỦA BẠN ĐÃ VÀO TỦ GẮP!',
        badgeText: 'Gấu bông số #',
        avatarEmoji: '🧸',
        colorLabel: 'Màu gấu bông may mắn',
        promptAction: 'đưa gấu bông của bạn vào tủ máy gắp',
        screenPrompt: 'để theo dõi tay gắp cơ học hạ xuống gắp trúng gấu bông của mình nhé!',
        bgGradient: 'radial-gradient(circle at 50% 0%, #6b21a8 0%, #3b0764 70%, #020617 100%)',
        accentColor: '#c084fc'
      };
    }
    return {
      title: 'ĐUA BI SINH TỬ',
      icon: '🏁',
      subtitle: 'Gia Nhập Vạch Xuất Phát',
      readyText: 'VIÊN BI CỦA BẠN ĐÃ VÀO VẠCH XUẤT PHÁT!',
      badgeText: 'Bi số #',
      avatarEmoji: '🏁',
      colorLabel: 'Màu viên bi may mắn',
      promptAction: 'đưa viên bi của bạn vào đường đua',
      screenPrompt: 'để theo dõi viên bi rơi dốc thác đổ và cổ vũ cho mình về nhất nhé!',
      bgGradient: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #090d16 70%, #030712 100%)',
      accentColor: '#38bdf8'
    };
  }, [lobby?.gameType]);

  // Handle Form Submit
  const handleJoin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanName = studentName.trim();
    if (!cleanName) {
      alert('Vui lòng nhập Họ và tên của bạn!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await MarbleLobbyService.joinLobby(pin, {
        name: cleanName,
        school: studentSchool.trim() || 'Học sinh',
        color: selectedColor.color
      });

      if (res.success) {
        setRegisteredStudent(res.participant);
        setCurrentQueueNumber(res.totalCount);
        setJoinedSuccess(true);
        playBeep();
        
        // Confetti explosion
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi kết nối phòng đua! Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to enter for another friend
  const handleEnterAnotherFriend = () => {
    setStudentName('');
    setSelectedColor(MARBLE_PALETTE[Math.floor(Math.random() * MARBLE_PALETTE.length)]);
    setJoinedSuccess(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '4px solid #38bdf8',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
          Đang kết nối vào phòng #{pin}...
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
          Vui lòng đợi trong giây lát
        </p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: gameInfo.bgGradient,
      color: '#f8fafc',
      fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif",
      padding: '16px 12px 32px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Top Gaming Badge */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '6px 14px',
          borderRadius: '24px',
          fontSize: '0.82rem',
          fontWeight: 800,
          color: gameInfo.accentColor,
          marginBottom: '10px',
          backdropFilter: 'blur(8px)'
        }}>
          <span>{gameInfo.icon}</span>
          <span>PHÒNG {gameInfo.title} #{pin}</span>
        </div>

        <h1 style={{
          fontSize: '1.65rem',
          fontWeight: 900,
          margin: 0,
          background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          {gameInfo.icon} {gameInfo.subtitle}
        </h1>

        <p style={{
          fontSize: '0.86rem',
          color: '#94a3b8',
          margin: '6px 0 0 0',
          fontWeight: 500
        }}>
          {lobby?.teacherName ? `Phòng của: ${lobby.teacherName}` : `Điền tên để ${gameInfo.promptAction}`}
        </p>
      </div>

      {/* Main Container Card */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        padding: '24px 20px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15)',
        backdropFilter: 'blur(16px)',
        boxSizing: 'border-box'
      }}>
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {!joinedSuccess ? (
          /* FORM NHẬP TÊN */
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Live 3D Ball Preview */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 0 6px 0'
            }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: selectedColor.gradient,
                boxShadow: `0 8px 24px -4px ${selectedColor.color}99, inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 6px rgba(255,255,255,0.7)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.25rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                border: '2px solid rgba(255,255,255,0.4)',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: 'scale(1.05)'
              }}>
                {initials}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px', fontWeight: 600 }}>
                Màu bi: <strong style={{ color: selectedColor.color }}>{selectedColor.name}</strong>
              </span>
            </div>

            {/* Input 1: Họ và tên */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#e2e8f0',
                marginBottom: '6px'
              }}>
                Họ và tên của bạn: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Gia Huy"
                maxLength={40}
                autoFocus
                required
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1.5px solid #334155',
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  padding: '12px 14px',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            {/* Input 2: Trường / Lớp */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#e2e8f0',
                marginBottom: '6px'
              }}>
                Trường / Lớp: <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>(Tùy chọn)</span>
              </label>
              <input
                type="text"
                value={studentSchool}
                onChange={(e) => setStudentSchool(e.target.value)}
                placeholder="Ví dụ: Lớp 7A1 hoặc Sky-Line"
                maxLength={50}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1.5px solid #334155',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  padding: '11px 14px',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            {/* Color Palette Selector */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#cbd5e1',
                marginBottom: '8px'
              }}>
                Chọn màu viên bi may mắn:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(9, 1fr)',
                gap: '8px'
              }}>
                {MARBLE_PALETTE.map((pal) => {
                  const isSelected = selectedColor.id === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setSelectedColor(pal)}
                      title={pal.name}
                      style={{
                        height: '34px',
                        borderRadius: '50%',
                        background: pal.gradient,
                        border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: isSelected ? `0 0 12px ${pal.color}, 0 2px 6px rgba(0,0,0,0.5)` : 'none',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !studentName.trim()}
              style={{
                marginTop: '8px',
                background: !studentName.trim() 
                  ? '#334155' 
                  : 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 18px',
                borderRadius: '14px',
                fontSize: '1.05rem',
                fontWeight: 900,
                cursor: !studentName.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: !studentName.trim() ? 'none' : '0 8px 24px rgba(37, 99, 235, 0.45)',
                transition: 'all 0.2s',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang ghi danh...
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#fde047" />
                  THAM GIA VÀO ĐƯỜNG ĐUA NGAY
                </>
              )}
            </button>
          </form>
        ) : (
          /* SUCCESS SCREEN (ĐÃ VÀO VẠCH XUẤT PHÁT) */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '12px 4px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              color: '#10b981'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#34d399',
              margin: '0 0 6px 0'
            }}>
              {gameInfo.readyText}
            </h2>

            <p style={{
              fontSize: '0.88rem',
              color: '#cbd5e1',
              margin: '0 0 16px 0',
              lineHeight: 1.5
            }}>
              Chúc mừng <strong>{registeredStudent?.name}</strong> đã ghi danh thành công vào {gameInfo.title}!
            </p>

            {/* Ticket Card */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
              border: `2px solid ${registeredStudent?.color || '#38bdf8'}`,
              borderRadius: '16px',
              padding: '18px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: `0 8px 24px -6px ${registeredStudent?.color || '#38bdf8'}66`
            }}>
              <div style={{
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                background: selectedColor.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.15rem',
                border: '2px solid #ffffff',
                boxShadow: `0 4px 14px ${selectedColor.color}`,
                flexShrink: 0
              }}>
                {initials}
              </div>

              <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {registeredStudent?.name}
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {registeredStudent?.school || 'Sky-Line'}
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  fontWeight: 800
                }}>
                  {gameInfo.icon} {gameInfo.badgeText}{currentQueueNumber} • Sẵn sàng
                </div>
              </div>
            </div>

            {/* Instruction Callout */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '0.85rem',
              color: '#e0f2fe',
              lineHeight: 1.5
            }}>
              👀 <strong>Hãy nhìn lên màn hình lớn của Thầy/Cô</strong> {gameInfo.screenPrompt}
            </div>

            {/* Enter for another student button */}
            <button
              onClick={handleEnterAnotherFriend}
              style={{
                width: '100%',
                background: '#1e293b',
                color: '#38bdf8',
                border: '1.5px solid #38bdf8',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={18} />
              Nhập thêm cho bạn ngồi cạnh
            </button>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div style={{
        marginTop: '20px',
        fontSize: '0.78rem',
        color: '#64748b',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        Hệ thống Trò chơi Giáo dục Sky-Line • Đua Bi Sinh Tử 2D
      </div>
    </div>
  );
}
